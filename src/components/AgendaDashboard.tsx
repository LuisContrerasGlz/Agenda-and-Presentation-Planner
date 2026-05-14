import { Clock, Users, ListFilter, Quote, ChevronRight, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface AgendaItem {
  topic: string;
  summary: string;
  actionItems?: string[];
  stakeholders?: string[];
  duration: number;
  presentationTips?: string;
}

interface AgendaData {
  title: string;
  totalDuration: number;
  presentationGuide: string;
  summary: string;
  agendaItems: AgendaItem[];
}

interface AgendaDashboardProps {
  data: AgendaData;
}

export function AgendaDashboard({ data }: AgendaDashboardProps) {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="border-b border-neutral-200 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400">
              <Activity className="w-4 h-4" />
              Intelligence Output
            </div>
            <h1 className="text-5xl md:text-7xl font-sans font-medium tracking-tight text-neutral-900">
              {data.title}
            </h1>
          </div>
          <div className="flex items-center gap-4 px-6 py-3 bg-neutral-900 text-neutral-100 rounded-full h-fit">
            <Clock className="w-5 h-5" />
            <span className="text-2xl font-mono">{data.totalDuration} min</span>
          </div>
        </div>
        <p className="mt-8 text-xl text-neutral-500 max-w-3xl leading-relaxed">
          {data.summary}
        </p>
      </div>

      {/* Presentation Guide */}
      <section className="bg-neutral-50 rounded-3xl p-8 border border-neutral-200/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-neutral-200 shadow-sm">
            <Quote className="w-5 h-5 text-neutral-600" />
          </div>
          <h2 className="text-xl font-medium">Presentation Strategy</h2>
        </div>
        <div className="prose prose-neutral max-w-none prose-p:text-neutral-600">
          <ReactMarkdown>{data.presentationGuide}</ReactMarkdown>
        </div>
      </section>

      {/* Agenda Items List */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 px-4">Timeline Details</h2>
        <div className="space-y-6">
          {data.agendaItems.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className="group relative bg-white border border-neutral-200 rounded-3xl p-8 hover:shadow-xl hover:shadow-neutral-100 transition-all duration-300"
            >
              <div className="grid md:grid-cols-[120px_1fr] gap-8">
                <div className="flex flex-col gap-2">
                  <span className="text-4xl font-mono text-neutral-900 font-light">
                    {item.duration}<span className="text-sm font-sans uppercase tracking-tighter text-neutral-400">m</span>
                  </span>
                  <div className="h-px bg-neutral-100 w-full" />
                  <span className="text-xs uppercase font-mono text-neutral-400">Sequence {index + 1}</span>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-medium text-neutral-900">{item.topic}</h3>
                  <p className="text-neutral-600 leading-relaxed text-lg">{item.summary}</p>
                  
                  <div className="grid sm:grid-cols-2 gap-8 pt-4 border-t border-neutral-50">
                    {item.actionItems && item.actionItems.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                          <ListFilter className="w-4 h-4" />
                          Key Outcomes
                        </div>
                        <ul className="space-y-2">
                          {item.actionItems.map((action, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                              <ChevronRight className="w-4 h-4 text-neutral-300 mt-0.5 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.stakeholders && item.stakeholders.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                          <Users className="w-4 h-4" />
                          Stakeholders
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.stakeholders.map((person, i) => (
                            <span key={i} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                              {person}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {item.presentationTips && (
                    <div className="mt-6 p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100 text-sm text-neutral-700 flex gap-4">
                      <span className="font-mono text-yellow-600 font-bold">PRO TIP:</span>
                      {item.presentationTips}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
