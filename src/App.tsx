import { useState } from 'react';
import { FileText, Wand2, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { AgendaDashboard } from './components/AgendaDashboard';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [docContent, setDocContent] = useState<{ text: string; fileName: string } | null>(null);
  const [totalTime, setTotalTime] = useState(60);
  const [meetingType, setMeetingType] = useState('meeting');
  const [isGenerating, setIsGenerating] = useState(false);
  const [agenda, setAgenda] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileProcessed = (text: string, fileName: string) => {
    setDocContent({ text, fileName });
    setAgenda(null);
    setError(null);
  };

  const generateAgenda = async () => {
    if (!docContent) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docText: docContent.text,
          totalTime,
          meetingType,
          fileName: docContent.fileName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate agenda');
      }

      const data = await response.json();
      setAgenda(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setDocContent(null);
    setAgenda(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 font-sans selection:bg-neutral-200">
      <main className="max-w-5xl mx-auto px-6 py-12 md:py-24">
        
        <AnimatePresence mode="wait">
          {!docContent ? (
            <motion.div
              key="step-upload"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12"
            >
              <header className="space-y-6 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-mono tracking-widest uppercase">
                  <Sparkles className="w-3 h-3" />
                  AI Meeting Facilitation
                </div>
                <h1 className="text-6xl font-light tracking-tighter text-neutral-900">
                  Craft the perfect <span className="italic font-serif">agenda</span>.
                </h1>
                <p className="text-xl text-neutral-500 leading-relaxed">
                  Upload your project documents, slides, or notes. We'll extract the core insights and build a surgical timeline for your next session.
                </p>
              </header>

              <div className="max-w-2xl mx-auto w-full">
                <FileUploader onFileProcessed={handleFileProcessed} />
              </div>
            </motion.div>
          ) : !agenda ? (
            <motion.div
              key="step-config"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 pb-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-neutral-400 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-mono">{docContent.fileName}</span>
                  </div>
                  <h2 className="text-4xl font-medium tracking-tight">Configuration</h2>
                </div>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Upload different file
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-mono uppercase tracking-widest text-neutral-400">Total Duration</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[15, 30, 45, 60, 90].map(t => (
                        <button
                          key={t}
                          onClick={() => setTotalTime(t)}
                          className={`px-4 py-2 rounded-xl text-xs font-mono border transition-all ${
                            totalTime === t 
                              ? 'bg-neutral-900 text-white border-neutral-900' 
                              : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {t}m
                        </button>
                      ))}
                    </div>
                    <div className="flex items-end gap-4">
                      <input
                        type="number"
                        value={totalTime}
                        onChange={(e) => setTotalTime(Number(e.target.value))}
                        className="text-6xl font-mono bg-transparent border-b-2 border-neutral-200 focus:border-black outline-none w-48 py-2 transition-colors"
                      />
                      <span className="text-2xl text-neutral-400 mb-2">minutes</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-mono uppercase tracking-widest text-neutral-400">Meeting Style</label>
                    <div className="flex gap-4">
                      {['meeting', 'presentation', 'workshop'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setMeetingType(type)}
                          className={`px-6 py-3 rounded-2xl border text-sm capitalize transition-all ${
                            meetingType === type
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-4 rounded-2xl">{error}</p>
                  )}

                  <button
                    onClick={generateAgenda}
                    disabled={isGenerating}
                    className="w-full h-16 bg-neutral-900 text-white rounded-2xl flex items-center justify-center gap-3 text-lg font-medium hover:bg-black transition-all group overflow-hidden relative"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Generate Agenda
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-200/50">
                  <h3 className="text-sm font-mono text-neutral-400 uppercase tracking-widest mb-4">Content Insight</h3>
                  <p className="line-clamp-[12] text-neutral-600 leading-relaxed italic">
                    "{docContent.text.slice(0, 800)}..."
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-agenda"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-12">
                <button
                  onClick={() => setAgenda(null)}
                  className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to configuration
                </button>
              </div>
              <AgendaDashboard data={agenda} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-neutral-100 mt-12">
        <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
          <span>AgendaCraft Intelligence</span>
          <span>© 2024 System Alpha</span>
        </div>
      </footer>
    </div>
  );
}

