import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import mammoth from "mammoth";
import AdmZip from "adm-zip";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";

import os from "os";

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const app = express();
const PORT = 3000;

// Multer config for file uploads - using os.tmpdir is safer
const upload = multer({ dest: os.tmpdir() });

app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/process-doc", upload.single("file"), async (req: any, res) => {
  if (!req.file) {
    console.error("No file in request");
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;
  const extension = path.extname(fileName).toLowerCase();

  console.log(`Processing file: ${fileName}, ext: ${extension}`);

  try {
    let text = "";

    if (extension === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (extension === ".pptx") {
      const zip = new AdmZip(filePath);
      const zipEntries = zip.getEntries();
      
      const slideEntries = zipEntries
        .filter(entry => entry.entryName.startsWith("ppt/slides/slide") && entry.entryName.endsWith(".xml"))
        .sort((a, b) => {
          const matchA = a.entryName.match(/\d+/);
          const matchB = b.entryName.match(/\d+/);
          const numA = matchA ? parseInt(matchA[0]) : 0;
          const numB = matchB ? parseInt(matchB[0]) : 0;
          return numA - numB;
        });

      if (slideEntries.length === 0) {
        // Try fallback for some office versions
        const fallbackSlides = zipEntries.filter(e => e.entryName.includes("slides/slide") && e.entryName.endsWith(".xml"));
        if (fallbackSlides.length > 0) {
          slideEntries.push(...fallbackSlides);
        }
      }

      for (const entry of slideEntries) {
        const content = entry.getData().toString("utf8");
        const tTags = content.match(/<a:t>([^<]*)<\/a:t>/g);
        if (tTags) {
          text += `[Slide Content Start]\n` + tTags.map(tag => tag.replace(/<\/?a:t>/g, "")).join(" ") + `\n[Slide Content End]\n\n`;
        }
      }
    } else if (extension === ".md" || extension === ".txt") {
      text = fs.readFileSync(filePath, "utf8");
    } else {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unsupported file type. Please upload .docx, .pptx, or .md/txt files." });
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    if (!text.trim()) {
      return res.status(400).json({ error: "Could not extract any text from the document." });
    }

    res.json({ text, fileName });
  } catch (error: any) {
    console.error("Error processing document:", error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: `Failed to process document: ${error.message}` });
  }
});

app.post("/api/generate-agenda", async (req, res) => {
  const { docText, totalTime, meetingType, fileName } = req.body;

  if (!docText) {
    return res.status(400).json({ error: "Document text is required" });
  }

  const isPresentation = meetingType === 'presentation' || (fileName && fileName.toLowerCase().endsWith('.pptx'));

  try {
    const prompt = `
      You are an expert meeting facilitator, executive presentation coach, and speechwriter.
      
      SOURCE CONTEXT:
      - Document Name: ${fileName}
      - Meeting Type: ${meetingType}
      - Total Time: ${totalTime} minutes
      - Content Source Is Presentation: ${isPresentation ? "YES" : "NO"}
      
      BASED ON THE FOLLOWING DOCUMENT CONTENT:
      ---
      ${docText}
      ---
      
      CRITICAL INSTRUCTIONS:
      1. Create a logical and highly professional agenda for a ${totalTime} minute session.
      2. If the source material is a presentation ([Slide Content Start] markers present), MAP the agenda items closely to slide groups.
      3. For each agenda item:
         - Provide a clear topic name.
         - Summarize the key message/objective.
         - Identify specific action items or decisions needed.
         - List potential stakeholders who should lead or be consulted.
         - Allocate a specific duration (total must be exactly ${totalTime}).
         - ${isPresentation ? "Provide specific coaching on HOW to present this section (body language, vocal emphasis, key transition phrases)." : "Provide facilitation tips on how to keep the discussion productive."}
      
      4. Include a "Presentation Strategy" or "Meeting Flow Guide" at the top level that explains how to distribute energy and time effectively.
      
      OUTPUT FORMAT (JSON):
      {
        "title": "Agenda: [Concise Title Based on Content]",
        "totalDuration": ${totalTime},
        "presentationGuide": "Strategy markdown...",
        "agendaItems": [
          {
            "topic": "...",
            "summary": "...",
            "actionItems": ["..."],
            "stakeholders": ["..."],
            "duration": 10,
            "presentationTips": "..."
          }
        ],
        "summary": "Overall objective summary..."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            totalDuration: { type: Type.NUMBER },
            presentationGuide: { type: Type.STRING },
            summary: { type: Type.STRING },
            agendaItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                  stakeholders: { type: Type.ARRAY, items: { type: Type.STRING } },
                  duration: { type: Type.NUMBER },
                  presentationTips: { type: Type.STRING }
                },
                required: ["topic", "summary", "duration"]
              }
            }
          },
          required: ["title", "totalDuration", "agendaItems", "summary"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    console.error("Error generating agenda:", error);
    res.status(500).json({ error: "Failed to generate agenda" });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
