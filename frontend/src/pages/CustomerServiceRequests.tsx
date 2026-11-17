import React, { useState, useEffect } from 'react';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Ban,
  ShieldAlert,
  ChevronRight,
  Info
} from 'lucide-react';
import api from '../services/api';

const SERVICE_REQUEST_CATEGORIES = [
  'Card Support',
  'Account Access Assistance',
  'Mobile Banking Support',
  'Internet Banking Support'
];

interface CustomerRequestItem {
  id: number;
  request_number: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  fulfillment_notes?: string;
  can_cancel: boolean;
  created_at: string;
}

export const CustomerServiceRequests: React.FC = () => {
  const [requests, setRequests] = useState<CustomerRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  // New Request Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Card Support');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Cancelling state
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customer/requests');
      setRequests(res.data);
    } catch (e) {
      console.error('Failed to load customer requests', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setSubmitting(true);
    setSubmitSuccess(null);
    try {
      const res = await api.post('/customer/requests', {
        title,
        category,
        description,
        priority
      });
      setSubmitSuccess(`Service request ${res.data.request_number} logged successfully.`);
      setTitle('');
      setDescription('');
      fetchRequests();
      setTimeout(() => {
        setSubmitSuccess(null);
        setActiveTab('list');
      }, 2500);
    } catch (e) {
      console.error('Failed to create request', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this service request? This action cannot be undone.')) {
      return;
    }
    setCancellingId(id);
    try {
      await api.post(`/customer/requests/${id}/cancel`);
      fetchRequests();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Failed to cancel request.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-navy-800" /> Banking Service Requests
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Request debit card limit upgrades, internet banking profile unlocking, and mobile device binding.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'list'
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            My Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-navy-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" /> Submit Request
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        /* Create Request Form */
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 animate-fadeIn">
          <div>
            <h3 className="text-base font-bold text-slate-900">Submit New Service Request</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Service requests are reviewed by our operations team within 24 business hours.
            </p>
          </div>

          {submitSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            {/* Category Selector */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Service Request Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SERVICE_REQUEST_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      category === cat
                        ? 'bg-navy-50 text-navy-900 border-navy-700 shadow-xs font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Request Subject *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Activate International E-Commerce on Debit Card"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Description & Justification *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details such as intended transfer limit, travel dates, or device model..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
              >
                <option value="Low">Low – Standard Processing</option>
                <option value="Medium">Medium – Priority Processing (24h)</option>
                <option value="High">High – Urgent Travel / Block Requirement</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-navy-800 hover:bg-navy-900 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                Submit Request
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Requests List */
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-navy-600" /> Loading your service requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400 space-y-3">
              <p>You have not submitted any service requests yet.</p>
              <button
                onClick={() => setActiveTab('create')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-800 text-white font-bold rounded-lg shadow-xs"
              >
                <PlusCircle className="w-4 h-4" /> Create First Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((r) => {
                const isFulfilled = r.status === 'Fulfilled' || r.status === 'Approved';
                const isRejected = r.status === 'Rejected';
                const isCancelled = r.status === 'Cancelled';
                const isPending = !isFulfilled && !isRejected && !isCancelled;

                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-mono text-xs font-bold text-navy-800 bg-navy-50 px-2 py-0.5 rounded">
                          {r.request_number}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isFulfilled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          (isRejected ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          (isCancelled ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'))
                        }`}>
                          {r.status}
                        </span>
                      </div>

                      <div className="mt-2.5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          {r.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{r.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-1">
                          {r.description}
                        </p>
                      </div>

                      {/* Approval / Rejection / Fulfillment Callouts */}
                      {r.fulfillment_notes && (
                        <div className="mt-3 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-emerald-900 text-[11px] leading-relaxed">
                          <strong>Fulfillment Summary:</strong> {r.fulfillment_notes}
                        </div>
                      )}
                      {r.rejection_reason && (
                        <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-[11px] leading-relaxed">
                          <strong>Rejection Reason:</strong> {r.rejection_reason}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        Submitted: {new Date(r.created_at).toLocaleDateString()}
                      </span>

                      {/* Cancel Request Button */}
                      {r.can_cancel && (
                        <button
                          onClick={() => handleCancelRequest(r.id)}
                          disabled={cancellingId === r.id}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          {cancellingId === r.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
