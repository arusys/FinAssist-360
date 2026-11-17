import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info,
  CreditCard,
  Building2,
  HelpCircle,
  Clock
} from 'lucide-react';
import api from '../services/api';

const COMPLAINT_CATEGORIES = [
  'Payment Failure',
  'ATM Failure',
  'Card Issue',
  'Login Problem',
  'Failed Transaction',
  'Duplicate Transaction'
];

const QUICK_TEMPLATES = [
  {
    label: "UPI Payment Failed",
    title: "UPI transfer failed but money deducted from bank account",
    category: "Payment Failure",
    desc: "Paid via UPI QR code, Rs 1,850 was debited from my account but merchant did not receive payment. RRN is UPI8291048291."
  },
  {
    label: "ATM Cash Not Dispensed",
    title: "ATM debited account but no cash came out from dispenser",
    category: "ATM Failure",
    desc: "Attempted to withdraw Rs 5,000 from ATM. Transaction timed out, card was returned and balance reduced, but dispenser shutter remained closed without giving cash."
  },
  {
    label: "Card Charged Twice",
    title: "Duplicate transaction debit on debit card",
    category: "Duplicate Transaction",
    desc: "I was charged twice for the same purchase of Rs 2,499 on my debit card. Please reconcile and refund the duplicate deduction."
  },
  {
    label: "Card Blocked / Declined",
    title: "Debit card declined for domestic transactions",
    category: "Card Issue",
    desc: "My debit card is getting declined for POS and online payments showing switch error. Please unblock and reset operational status."
  },
  {
    label: "App Login Error",
    title: "Mobile banking app login failed after update",
    category: "Login Problem",
    desc: "Mobile banking application shows device binding verification failed when attempting biometric or MPIN login."
  }
];

interface AIAnalysisResult {
  suggested_category: string;
  recommended_priority: string;
  affected_service: string;
  reasoning: string;
  troubleshooting_tips: string[];
}

export const RaiseComplaint: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Payment Failure');
  const [description, setDescription] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // AI analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiApplied, setAiApplied] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    complaint_id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
  } | null>(null);

  const applyTemplate = (t: typeof QUICK_TEMPLATES[0]) => {
    setTitle(t.title);
    setCategory(t.category);
    setDescription(t.desc);
    setErrorMsg(null);
  };

  const handleAnalyzeWithAI = async () => {
    if (!description || description.trim().length < 3) return;
    setAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await api.post('/customer/complaints/ai-analyze', {
        title: title || description.slice(0, 50),
        description,
        transaction_reference: transactionRef
      });
      setAiAnalysis(res.data);
      if (res.data.suggested_category) {
        setCategory(res.data.suggested_category);
      }
      setAiApplied(true);
    } catch (e: any) {
      console.error('AI Analysis failed', e);
      setErrorMsg(e?.response?.data?.detail || 'AI Analysis unavailable, standard categorization will be applied upon submission.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const descText = description.trim();
    if (!descText) {
      setErrorMsg('Please describe your banking problem so we can register and investigate it.');
      return;
    }
    const resolvedTitle = title.trim() || (descText.slice(0, 60) + (descText.length > 60 ? '...' : ''));
    setSubmitting(true);
    try {
      const res = await api.post('/customer/complaints', {
        title: resolvedTitle,
        category: category || 'Payment Failure',
        description: descText,
        transaction_reference: transactionRef.trim() || undefined,
        attachment_name: attachmentName.trim() || undefined,
        ai_applied: aiApplied
      });
      setSubmittedResult(res.data);
    } catch (err: any) {
      console.error('Submission failed', err);
      setErrorMsg(err?.response?.data?.detail || 'Unable to submit complaint. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedResult) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Complaint Logged Successfully
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
              Complaint Reference: <span className="font-mono text-navy-800">{submittedResult.complaint_id}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Your banking issue has been prioritized under category <strong className="text-slate-800">{submittedResult.category}</strong> and forwarded to our specialized operations team.
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs max-w-md mx-auto space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Complaint Title:</span>
              <span className="font-semibold text-slate-900">{submittedResult.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Priority:</span>
              <span className="font-semibold text-navy-800">{submittedResult.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Status:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {submittedResult.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">AI Classification:</span>
              <span className="font-semibold text-teal-700">{aiApplied ? 'Applied with GenAI' : 'Standard'}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/my-complaints"
              className="w-full sm:w-auto px-5 py-2.5 bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" /> Track in My Complaints
            </Link>
            <Link
              to="/ai-assistant"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-teal-600" /> Ask AI Banking Assistant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-navy-800" /> Raise a Banking Complaint
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lodge an operational dispute, failed payment, or terminal issue with real-time GenAI classification and resolution tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Problem Templates */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Quick-Fill Common Problem Templates:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TEMPLATES.map((tmpl) => (
                <button
                  type="button"
                  key={tmpl.label}
                  onClick={() => applyTemplate(tmpl)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 hover:border-teal-300 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  + {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Complaint Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMPLAINT_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition-all ${
                    category === cat
                      ? 'bg-navy-50 text-navy-900 border-navy-700 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Complaint Subject / Title <span className="text-slate-400 font-normal">(Optional - auto-generated from description if omitted)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ₹3,500 debited via UPI but merchant payment failed"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800">
                Detailed Problem Description *
              </label>
              <button
                type="button"
                onClick={handleAnalyzeWithAI}
                disabled={analyzing || description.length < 3}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 disabled:opacity-40 flex items-center gap-1 transition-colors"
              >
                {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Analyze with GenAI
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your banking problem (what happened, approximate time, error on screen, merchant or ATM location)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all"
            />
          </div>

          {/* Transaction Reference & Attachment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Transaction Reference / RRN (Optional)
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. UPI 429104829102 / POS txn ID"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Attachment / Screenshot (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="e.g. payment_receipt.png"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-600"
                />
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              Complaints are covered under standard Banking Ombudsman TAT timelines.
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-navy-800 hover:bg-navy-900 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition-all shrink-0"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              Submit Complaint
            </button>
          </div>
        </form>

        {/* Right 1 Col: GenAI Classification & Guidance Box */}
        <div className="space-y-4">
          <div className="bg-gradient-to-b from-slate-900 to-navy-950 rounded-2xl p-5 text-white shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                GenAI Triage Assistant
              </h3>
            </div>

            {aiAnalysis ? (
              <div className="space-y-3 animate-fadeIn text-xs">
                <div className="bg-white/10 rounded-lg p-3 border border-white/10 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-teal-400">Recommended Category</div>
                  <div className="font-bold text-white text-sm">{aiAnalysis.suggested_category}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/10 rounded-lg p-2.5 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-slate-300">Priority</div>
                    <div className="font-bold text-amber-300">{aiAnalysis.recommended_priority}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2.5 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-slate-300">Service</div>
                    <div className="font-bold text-white truncate">{aiAnalysis.affected_service}</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                  <strong>Triage Reasoning:</strong> {aiAnalysis.reasoning}
                </div>

                {aiAnalysis.troubleshooting_tips && aiAnalysis.troubleshooting_tips.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] uppercase font-bold text-teal-300">Helpful Advice</div>
                    <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                      {aiAnalysis.troubleshooting_tips.map((tip, idx) => (
                        <li key={idx} className="leading-snug">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-[10px] text-teal-400 flex items-center gap-1 font-semibold pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Classification automatically applied to complaint
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto text-teal-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your complaint description and click <strong>"Analyze with GenAI"</strong> to receive real-time intent extraction, category classification, and troubleshooting guidance before submitting.
                </p>
              </div>
            )}
          </div>

          {/* Quick Help Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-xs space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-navy-700" /> Auto-Reversal Guidelines
            </h4>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              For failed UPI transactions where money was deducted, NPCI mandates auto-reversal within T+1 working days. If funds are not credited within 24 hours, bank compensation of ₹100 per day applies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
