import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  RefreshCw,
  X
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Incident, BankingService } from '../types';

export const IncidentManagement: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [services, setServices] = useState<BankingService[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState('Payment Failure');
  const [newPri, setNewPri] = useState('P3 – Medium');
  const [newServiceId, setNewServiceId] = useState<number | undefined>(undefined);
  const [newDept, setNewDept] = useState('Retail Banking Operations');
  const [submitting, setSubmitting] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (statusFilter) params.append('status', statusFilter);

      const [incRes, servRes] = await Promise.all([
        api.get(`/incidents?${params.toString()}`),
        api.get('/services')
      ]);
      setIncidents(incRes.data);
      setServices(servRes.data);
    } catch (e) {
      console.error('Failed to fetch incidents', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [categoryFilter, priorityFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIncidents();
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/incidents', {
        title: newTitle,
        description: newDesc,
        category: newCat,
        priority: newPri,
        service_id: newServiceId || null,
        assigned_department: newDept
      });
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      fetchIncidents();
    } catch (err) {
      console.error('Failed to create incident', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Incident Management (USM)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            End-to-end incident lifecycle tracking, SLA enforcement, and investigation notes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/incidents/export/csv"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </a>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Log Incident
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, ID, customer..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Payment Failure">Payment Failure</option>
            <option value="ATM Failure">ATM Failure</option>
            <option value="Card Issues">Card Issues</option>
            <option value="Mobile Banking">Mobile Banking</option>
            <option value="Internet Banking">Internet Banking</option>
            <option value="Transaction Disputes">Transaction Disputes</option>
            <option value="Banking Infrastructure">Banking Infrastructure</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="P1 – Critical">P1 – Critical</option>
            <option value="P2 – High">P2 – High</option>
            <option value="P3 – Medium">P3 – Medium</option>
            <option value="P4 – Low">P4 – Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {(categoryFilter || priorityFilter || statusFilter || search) && (
            <button
              onClick={() => {
                setCategoryFilter('');
                setPriorityFilter('');
                setStatusFilter('');
                setSearch('');
              }}
              className="text-xs text-rose-600 hover:underline px-2 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Incident Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-navy-600" /> Loading incidents...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Incident ID</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Department</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No incidents match the applied filters.
                    </td>
                  </tr>
                ) : (
                  incidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-navy-800">
                        <Link to={`/incidents/${inc.id}`} className="hover:underline">
                          {inc.incident_number}
                        </Link>
                        {inc.ai_generated && (
                          <span className="block text-[10px] text-navy-600 font-sans font-semibold">
                            AI-Classified
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-semibold text-slate-900 truncate">{inc.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{inc.description}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate">{inc.category}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={inc.priority} type="priority" />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={inc.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate">{inc.assigned_department}</td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(inc.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/incidents/${inc.id}`}
                          className="px-2.5 py-1 text-[11px] font-semibold text-navy-700 bg-navy-50 hover:bg-navy-100 rounded border border-navy-200 transition-colors"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Log New Service Incident</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Incident Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. UPI Switch Timeout during Peak Batch"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide incident symptoms, affected users, error codes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none"
                  >
                    <option value="Payment Failure">Payment Failure</option>
                    <option value="ATM Failure">ATM Failure</option>
                    <option value="Card Issues">Card Issues</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                    <option value="Internet Banking">Internet Banking</option>
                    <option value="Transaction Disputes">Transaction Disputes</option>
                    <option value="Banking Infrastructure">Banking Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPri}
                    onChange={(e) => setNewPri(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none"
                  >
                    <option value="P1 – Critical">P1 – Critical (2h SLA)</option>
                    <option value="P2 – High">P2 – High (4h SLA)</option>
                    <option value="P3 – Medium">P3 – Medium (24h SLA)</option>
                    <option value="P4 – Low">P4 – Low (48h SLA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Affected Service</label>
                  <select
                    value={newServiceId || ''}
                    onChange={(e) => setNewServiceId(Number(e.target.value) || undefined)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none"
                  >
                    <option value="">Select Service (Optional)</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Routing Department</label>
                  <input
                    type="text"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none"
                  >
                  </input>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
