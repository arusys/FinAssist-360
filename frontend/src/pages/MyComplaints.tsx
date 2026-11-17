import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ChevronRight,
  Send,
  RefreshCw,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Activity
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CustomerComplaintItem {
  id: number;
  complaint_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  service_name: string;
  assigned_department: string;
  root_cause?: string;
  resolution_summary?: string;
  created_at: string;
  resolved_at?: string;
  notes_count: number;
}

interface WorkflowStage {
  key: string;
  title: string;
  desc: string;
  done: boolean;
  active: boolean;
}

interface ComplaintDetailData extends CustomerComplaintItem {
  workflow_stages: WorkflowStage[];
  notes: Array<{
    id: number;
    author_name: string;
    content: string;
    is_internal: boolean;
    created_at: string;
  }>;
  history: Array<{
    id: number;
    changed_by: string;
    action: string;
    details?: string;
    created_at: string;
  }>;
}

export const MyComplaints: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<CustomerComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected complaint detail modal
  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<ComplaintDetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Reply form
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/customer/complaints?${params.toString()}`);
      setComplaints(res.data);
    } catch (e) {
      console.error('Failed to load complaints', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  const openComplaintDetail = async (id: number) => {
    setSelectedComplaintId(id);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/customer/complaints/${id}`);
      setDetailData(res.data);
    } catch (e) {
      console.error('Failed to load complaint detail', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintId || !replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await api.post(`/customer/complaints/${selectedComplaintId}/reply`, {
        content: replyText
      });
      setReplyText('');
      setReplySuccess(true);
      setTimeout(() => setReplySuccess(false), 3000);
      // Refresh detail
      const res = await api.get(`/customer/complaints/${selectedComplaintId}`);
      setDetailData(res.data);
    } catch (e) {
      console.error('Failed to submit reply', e);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-navy-800" /> My Banking Complaints
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor your submitted disputes, view real-time multi-stage investigation timelines, and communicate with service desk agents.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by complaint ID, reference, or title..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
          >
            <option value="">All Categories</option>
            <option value="Payment Failure">Payment Failure</option>
            <option value="ATM Failure">ATM Failure</option>
            <option value="Card Issues">Card Issues</option>
            <option value="Login Problem">Login Problem</option>
            <option value="Failed Transaction">Failed Transaction</option>
            <option value="Duplicate Transaction">Duplicate Transaction</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending Approval</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <button
            onClick={fetchComplaints}
            className="p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-navy-600" /> Loading your complaints...
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No complaints matched your search filters.
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => {
            const isResolved = c.status === 'Resolved' || c.status === 'Closed';
            const isInProgress = c.status === 'In Progress' || c.status === 'Assigned';
            return (
              <div
                key={c.id}
                onClick={() => openComplaintDetail(c.id)}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-navy-900 bg-navy-50 px-2 py-0.5 rounded">
                      {c.complaint_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isResolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      (isInProgress ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700')
                    }`}>
                      {c.status}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {c.priority}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">• {c.service_name}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>

                  <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-3">
                    <span>Category: <strong>{c.category}</strong></span>
                    <span>•</span>
                    <span>Logged on: {new Date(c.created_at).toLocaleDateString()}</span>
                    {c.notes_count > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-navy-700 font-semibold">
                          <MessageSquare className="w-3.5 h-3.5" /> {c.notes_count} updates
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button className="px-3.5 py-1.5 bg-slate-50 hover:bg-navy-50 text-navy-800 text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1">
                    View Progress <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complaint Detail & 9-Stage Workflow Modal */}
      {selectedComplaintId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-navy-950">
                  {detailData?.complaint_id || 'Complaint Progress'}
                </span>
                {detailData && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    detailData.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {detailData.status}
                  </span>
                )}
              </div>
              <button
                onClick={() => { setSelectedComplaintId(null); setDetailData(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {loadingDetail || !detailData ? (
                <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-navy-600" /> Loading complete history and workflow...
                </div>
              ) : (
                <>
                  {/* Overview */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{detailData.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line leading-relaxed">
                      {detailData.description}
                    </p>
                  </div>

                  {/* Resolution Callout if Resolved */}
                  {detailData.resolution_summary && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800 text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Resolution Summary
                      </div>
                      <p className="text-xs leading-relaxed text-emerald-900">
                        {detailData.resolution_summary}
                      </p>
                      {detailData.resolved_at && (
                        <div className="text-[10px] text-emerald-700 font-mono mt-1">
                          Resolved on: {new Date(detailData.resolved_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Requirement 7: 9-Stage Complaint Tracking Workflow Timeline */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-navy-700" /> Complaint Tracking Workflow
                      </h4>
                      <span className="text-[10px] text-slate-500">Live Stage Tracker</span>
                    </div>

                    <div className="space-y-3 pt-2">
                      {detailData.workflow_stages.map((stage, idx) => (
                        <div key={stage.key} className="flex items-start gap-3">
                          {/* Indicator circle */}
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              stage.done
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : stage.active
                                ? 'bg-amber-500 text-white animate-pulse'
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                              {stage.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : (idx + 1)}
                            </div>
                            {idx < detailData.workflow_stages.length - 1 && (
                              <div className={`w-0.5 h-6 ${stage.done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                            )}
                          </div>

                          <div className="pb-1">
                            <div className={`font-bold text-xs ${stage.done ? 'text-slate-900' : stage.active ? 'text-amber-800' : 'text-slate-400'}`}>
                              {stage.title}
                            </div>
                            <div className="text-[11px] text-slate-500">{stage.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes & Replies History */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Case Communications & Updates
                    </h4>

                    {detailData.notes.length === 0 ? (
                      <div className="p-4 bg-slate-50 rounded-lg text-slate-400 text-center">
                        No additional updates recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {detailData.notes.map((n) => (
                          <div key={n.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                            <div className="flex items-center justify-between text-slate-500 mb-1">
                              <span className="font-bold text-slate-900">{n.author_name}</span>
                              <span className="font-mono text-[10px]">{new Date(n.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{n.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Customer Reply Box */}
                  <form onSubmit={handleSendReply} className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-800">
                      Add Information / Reply to Service Desk
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type additional details or respond to service desk inquiries..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={submittingReply || !replyText.trim()}
                        className="px-4 py-2 bg-navy-800 hover:bg-navy-900 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        {submittingReply ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Send Reply
                      </button>
                    </div>
                    {replySuccess && (
                      <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reply added to complaint timeline.
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
