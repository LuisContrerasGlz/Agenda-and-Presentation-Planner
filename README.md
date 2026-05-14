# Agenda and Presentation Planner

A lightweight AI-powered app to help you craft meeting agendas from any uploaded document. Upload a DOCX, PPT, or Markdown file and receive a structured agenda with:

- topic summaries
- action items
- stakeholders (when applicable)
- time distribution suggestions
- presentation pacing and coverage guidance

If you specify a total meeting time, the app will suggest how to divide the agenda so you can cover the full session efficiently.

You can also open the live app directly in AI Studio at: https://ai.studio/apps/e79b51de-a992-46ed-b70e-01ea94ba78b6

## What this app does

- Accepts uploaded documents like `.docx`, `.ppt`, and `.md`
- Parses document content into agenda topics
- Generates concise summaries for each topic
- Identifies action items and possible stakeholders
- Recommends how to allocate time across agenda sections
- Offers a presentation structure guide for slide decks

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create a `.env.local` file and set your Gemini API key:
   `GEMINI_API_KEY=your_api_key_here`
3. Start the app:
   `npm run dev`

## Notes

- The app is built with Vite and a React frontend.
- Use the uploader to provide your source document, then enter total meeting time for tailored timing guidance.
- If you want to adapt the app for a different AI provider, update the API integration in `server.ts`.
