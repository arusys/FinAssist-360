import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ShieldCheck,
  RefreshCw,
  BookOpen,
  ArrowRight,
  PlusCircle,
  Activity,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: Array<{
    document_title: string;
    section_name?: string;
    content: string;
    similarity_score: number;
  }>;
  suggested_actions?: Array<{
    label: string;
    path: string;
  }>;
  grounded?: boolean;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  "Submit problem: UPI payment deducted but merchant unpaid",
  "Report issue: ATM debited money but no cash dispensed",
  "Check status of my recent complaints",
  "How do I temporarily block or unlock my debit card?",
  "What is the RBI auto-reversal TAT compensation policy for ATM failure?"
];

export const AIBankingAssistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${user?.full_name?.split(' ')[0] || 'there'}! I am your FinAssist 360 AI Banking Assistant. You can directly describe and submit a banking problem here (e.g. "Submit problem: ₹2000 debited from ATM without cash"), check the status of your existing complaints, or ask for guidance on failed UPI and card transactions. How may I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggested_actions: [
        { label: "Submit a Problem", path: "/raise-complaint" },
        { label: "Check My Complaints", path: "/my-complaints" },
        { label: "Banking Service Status", path: "/service-status" }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/customer/ai-assistant', {
        message: textToSend
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.data.answer,
        sources: res.data.sources,
        suggested_actions: res.data.suggested_actions,
        grounded: res.data.grounded,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error('Chat request failed', e);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I am having temporary difficulty accessing our core banking switch telemetry. Please try again or visit My Complaints to check your status directly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-navy-800 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              AI Banking Assistant
              <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full border border-teal-200">
                Grounded RAG 1.5
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Verified banking guidelines & private personal complaint lookup
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium hidden sm:flex">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Customer Privacy Protected</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-navy-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-4 h-4 text-teal-300" />
              </div>
            )}

            <div className={`max-w-xl space-y-2.5 ${
              m.sender === 'user'
                ? 'bg-navy-800 text-white rounded-2xl rounded-tr-none p-3.5 shadow-xs'
                : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-2xl rounded-tl-none p-4 shadow-xs'
            }`}>
              {/* Message text with formatting */}
              <div className="leading-relaxed whitespace-pre-line text-xs">
                {m.text}
              </div>

              {/* RAG Sources Citations */}
              {m.sources && m.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-[11px]">
                  <div className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 text-[10px]">
                    <BookOpen className="w-3.5 h-3.5 text-navy-700" /> Cited Bank Knowledge Policies
                  </div>
                  <div className="space-y-1">
                    {m.sources.map((s, idx) => (
                      <div key={idx} className="bg-white p-2 rounded border border-slate-200/70 text-slate-600 font-mono text-[10px]">
                        <strong>{s.document_title}</strong> {s.section_name ? `• ${s.section_name}` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Actions CTA Pills */}
              {m.suggested_actions && m.suggested_actions.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {m.suggested_actions.map((act, idx) => (
                    <Link
                      key={idx}
                      to={act.path}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-navy-50 text-navy-800 font-bold rounded-lg border border-slate-200 text-[11px] shadow-xs transition-colors"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              )}

              <div className={`text-[9px] font-mono text-right ${m.sender === 'user' ? 'text-navy-200' : 'text-slate-400'}`}>
                {m.timestamp}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-navy-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4 text-teal-300" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-slate-500 text-xs flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-navy-700" />
              <span>Querying verified knowledge base & banking records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Bar */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Suggestions:</span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-full border border-slate-200 shrink-0 text-[11px] font-medium transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about a failed transaction, check complaint status, or bank policies..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-navy-800 hover:bg-navy-900 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
