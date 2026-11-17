import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  FileText
} from 'lucide-react';
import api from '../services/api';
import { AgentPipelineViewer } from '../components/AgentPipelineViewer';
import { AgentOrchestrationResponse } from '../types';

const SUGGESTED_PROMPTS = [
  {
    label: "UPI Payment Deducted, Merchant Not Credited",
    query: "My UPI payment of INR 4,299 was debited for Flipkart order, but the merchant did not receive money. RRN is RRN9928340192."
  },
  {
    label: "ATM Cash Dispense Failure",
    query: "I tried to withdraw INR 10,000 from ATM-MUM-402 Bandra. Account was deducted but no cash came out from dispenser shutter."
  },
  {
    label: "Mobile Banking SIM Binding Error",
    query: "My mobile banking application is not opening and showing SIM binding verification failed after updating to Android 14."
  },
  {
    label: "Duplicate Transaction Dispute",
    query: "I was charged twice for INR 89,900 on my card for Apple Store purchase. Please refund the duplicate debit immediately."
  }
];

export const AIServiceDesk: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AgentOrchestrationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (textToSubmit?: string) => {
    const text = textToSubmit || query;
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/chat', {
        message: text,
        customer_id: 'CUST-98321'
      });
      setResponse(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to process banking complaint through AI orchestrator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-navy-800 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5 text-navy-200" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              AI Service Desk
              <span className="text-xs bg-navy-100 text-navy-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Multi-Agent USM
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Natural-language banking complaint intake, core ledger audit, RAG policy lookup & automated incident generation
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div>
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-navy-600" /> Suggested Banking Scenarios:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SUGGESTED_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(p.query);
                handleSubmit(p.query);
              }}
              className="text-left p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-navy-300 transition-all text-xs group"
            >
              <div className="font-semibold text-navy-900 group-hover:text-navy-700 flex items-center justify-between">
                <span>{p.label}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-navy-600" />
              </div>
              <div className="text-slate-500 mt-1 line-clamp-1">{p.query}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Complaint Input Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Enter Customer Banking Complaint (Natural Language)
        </label>
        <div className="relative">
          <textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. My online payment was deducted, but the merchant did not receive the money. RRN is..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all resize-none"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Evaluated by 7 deterministic AI agents with grounded banking knowledge
            </span>
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-navy-800 hover:bg-navy-900 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Orchestrating 7 Agents...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Analyze & Process Complaint
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Response Section */}
      {response && (
        <div className="space-y-6 animate-fadeIn">
          {/* Incident Generated Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-emerald-950">
                  Incident Logged Successfully: {response.incident_number}
                </h3>
              </div>
              {response.created_incident_id && (
                <Link
                  to={`/incidents/${response.created_incident_id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Inspect Incident Record <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Verdict summary chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Service</span>
                <span className="font-bold text-slate-800">{response.structured_verdict.service}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Priority</span>
                <span className="font-bold text-rose-700">{response.structured_verdict.priority}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Routing Department</span>
                <span className="font-bold text-slate-800">{response.structured_verdict.department}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Approval Required</span>
                <span className={`font-bold ${response.structured_verdict.requires_approval ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {response.structured_verdict.requires_approval ? 'Yes (Manager)' : 'No (Automated)'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Response Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-navy-700" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Synthesized Customer Resolution Message
              </h3>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-800 whitespace-pre-line border border-slate-200">
              {response.final_customer_response}
            </div>

            {/* Recommended Troubleshooting Steps */}
            {response.structured_verdict.troubleshooting_steps?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Actionable Recommendations & Next Steps:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {response.structured_verdict.troubleshooting_steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-navy-600 mt-1.5 shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Multi-Agent Execution Trace (7 Agents) */}
          <AgentPipelineViewer
            steps={response.steps}
            totalDurationMs={response.total_execution_time_ms}
          />
        </div>
      )}
    </div>
  );
};
