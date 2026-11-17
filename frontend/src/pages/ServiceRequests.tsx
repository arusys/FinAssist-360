import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { ServiceRequest } from '../types';

export const ServiceRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState('Employee Access Request');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDept, setNewDept] = useState('Retail Banking Operations');
  const [submitting, setSubmitting] = useState(false);

  // Approval action
  const [actionReqId, setActionReqId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'Approve' | 'Reject'>('Approve');
  const [actionReason, setActionReason] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/requests?${params.toString()}`);
      setRequests(res.data);
    } catch (e) {
      console.error('Failed to fetch service requests', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [categoryFilter, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/requests', {
        title: newTitle,
        description: newDesc,
        category: newCat,
        priority: newPriority,
        requester_name: user?.full_name || 'Banking Staff',
        requester_email: user?.email || 'staff@finassist360.bank',
        department: newDept
      });
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      fetchRequests();
    } catch (e) {
      console.error('Failed to create request', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionReqId) return;
    try {
      const isApproved = actionType === 'Approve';
      await api.patch(`/requests/${actionReqId}`, {
        status: isApproved ? 'Approved' : 'Rejected',
        approved_by: isApproved ? user?.full_name : undefined,
        rejection_reason: !isApproved ? actionReason : undefined,
        fulfillment_notes: isApproved ? actionReason || 'Approved under standard operational policy' : undefined
      });
      setActionReqId(null);
      setActionReason('');
      fetchRequests();
    } catch (e) {
      console.error('Action failed', e);
    }
  };

  const isManagerOrAdmin = user?.role === 'Service Manager' || user?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Service Request Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Internal IT, access provisioning, hardware support & operational approvals
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Submit Service Request
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700"
          >
            <option value="">All Categories</option>
            <option value="Employee Access Request">Employee Access</option>
            <option value="Banking Application Access">Banking Application Access</option>
            <option value="Software Installation">Software Installation</option>
            <option value="Password Reset Request">Password Reset</option>
            <option value="Hardware Support Request">Hardware Support</option>
            <option value="New Employee Onboarding">New Employee Onboarding</option>
            <option value="Departmental Service Request">Departmental Service</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="In Progress">In Progress</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Rejected">Rejected</option>
          </select>

          {(categoryFilter || statusFilter) && (
            <button
              onClick={() => { setCategoryFilter(''); setStatusFilter(''); }}
              className="text-xs text-rose-600 hover:underline px-2"
            >
              Reset
            </button>
          )}
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          {requests.length} Requests Found
        </span>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-navy-600" /> Loading requests...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.map((r) => {
                  const isPending = r.status === 'Submitted' || r.status === 'Under Review';
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-navy-800">{r.request_number}</td>
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-semibold text-slate-900 truncate">{r.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{r.description}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate">{r.category}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{r.requester_name}</div>
                        <div className="text-[10px] text-slate-400">{r.department}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700">{r.priority}</span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isPending && isManagerOrAdmin ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setActionReqId(r.id);
                                setActionType('Approve');
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded border border-emerald-200 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setActionReqId(r.id);
                                setActionType('Reject');
                              }}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded border border-rose-200 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {r.approved_by ? `Approved by ${r.approved_by.split(' ')[0]}` : r.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Submit Service Request</h3>
              <button onClick={() => setCreateModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Request Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Core Banking Application Access"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Details & Justification *</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="State the technical requirement and manager justification..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  >
                    <option value="Employee Access Request">Employee Access</option>
                    <option value="Banking Application Access">Banking Application Access</option>
                    <option value="Software Installation">Software Installation</option>
                    <option value="Password Reset Request">Password Reset</option>
                    <option value="Hardware Support Request">Hardware Support</option>
                    <option value="New Employee Onboarding">New Employee Onboarding</option>
                    <option value="Departmental Service Request">Departmental Service</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-navy-800 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {actionReqId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-scaleIn">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
              Confirm {actionType} for Service Request
            </h3>
            <form onSubmit={handleDecision} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recorded Decision Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={`Reason for ${actionType.toLowerCase()}ing this request...`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActionReqId(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded-lg font-bold text-white ${
                    actionType === 'Approve' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  Confirm {actionType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
