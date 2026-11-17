import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  MessageSquare,
  History,
  Send,
  X,
  FileCheck
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Incident } from '../types';
import { useAuth } from '../context/AuthContext';
import { canAssignIncidents, canResolveIncidents } from '../utils/rbac';

export const IncidentDetail: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  // Note form
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Assign modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState<number>(3); // Default to agent
  const [assignDept, setAssignDept] = useState('');

  // Resolve modal
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [rootCauseInput, setRootCauseInput] = useState('');
  const [resolutionNotesInput, setResolutionNotesInput] = useState('');

  const fetchIncident = async () => {
    try {
      const res = await api.get(`/incidents/${id}`);
      setIncident(res.data);
      setAssignDept(res.data.assigned_department || 'Retail Banking Operations');
      setRootCauseInput(res.data.root_cause || '');
      setResolutionNotesInput(res.data.resolution_notes || '');
    } catch (e) {
      console.error('Failed to load incident detail', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      await api.post(`/incidents/${id}/notes`, { content: newNote, is_internal: true });
      setNewNote('');
      fetchIncident();
    } catch (e) {
      console.error('Failed to add note', e);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/incidents/${id}/assign`, {
        assigned_to_id: assignUserId,
        assigned_department: assignDept
      });
      setAssignModalOpen(false);
      fetchIncident();
    } catch (e) {
      console.error('Assign failed', e);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/incidents/${id}/resolve`, {
        root_cause: rootCauseInput,
        resolution_notes: resolutionNotesInput
      });
      setResolveModalOpen(false);
      fetchIncident();
    } catch (e) {
      console.error('Resolve failed', e);
    }
  };

  if (loading || !incident) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading incident dossier...
      </div>
    );
  }

  const isResolvedOrClosed = incident.status === 'Resolved' || incident.status === 'Closed';

  return (
    <div className="space-y-6">
      {/* Top back navigation & status bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/incidents"
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-bold text-navy-950">
                {incident.incident_number}
              </span>
              <StatusBadge status={incident.priority} type="priority" />
              <StatusBadge status={incident.status} />
              {incident.ai_generated && (
                <span className="text-[10px] bg-navy-100 text-navy-800 font-bold px-2 py-0.5 rounded-full">
                  AI Orchestrated ({incident.ai_confidence})
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-800 mt-0.5">
              {incident.title}
            </h2>
          </div>
        </div>

        {/* Action buttons with RBAC */}
        <div className="flex items-center gap-2">
          {!isResolvedOrClosed && (
            <>
              {canAssignIncidents(user?.role) && (
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-navy-700" /> Assign
                </button>
              )}
              {canResolveIncidents(user?.role) && (
                <button
                  onClick={() => setResolveModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Details & Notes / Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Incident Details & Investigation Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Overview Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Operational Scope & Symptom Summary
            </h3>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
              {incident.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Category</span>
                <span className="font-semibold text-slate-800">{incident.category}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Service Impacted</span>
                <span className="font-semibold text-navy-800">{incident.service_name || 'Cross-Service'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Assigned Dept</span>
                <span className="font-semibold text-slate-800">{incident.assigned_department}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Reported By</span>
                <span className="text-slate-700">{incident.reported_by}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Customer / Terminal</span>
                <span className="font-mono text-slate-700">{incident.customer_identifier || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">SLA Target Due</span>
                <span className="font-mono text-amber-700 font-semibold">
                  {incident.sla_due_at ? new Date(incident.sla_due_at).toLocaleString() : '24h Standard'}
                </span>
              </div>
            </div>

            {/* Root Cause & Resolution Info (if available) */}
            {(incident.root_cause || incident.resolution_notes) && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                {incident.root_cause && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs">
                    <span className="font-bold text-amber-900 block mb-0.5">Identified Root Cause:</span>
                    <span className="text-amber-800">{incident.root_cause}</span>
                  </div>
                )}
                {incident.resolution_notes && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs">
                    <span className="font-bold text-emerald-900 block mb-0.5">Resolution Notes & Post-Mortem:</span>
                    <span className="text-emerald-800">{incident.resolution_notes}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Investigation Notes & Communication */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-navy-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Internal Investigation Notes ({incident.notes?.length || 0})
                </h3>
              </div>
            </div>

            {/* Existing Notes */}
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {!incident.notes || incident.notes.length === 0 ? (
                <div className="text-xs text-slate-400 py-3 text-center">
                  No internal notes recorded yet.
                </div>
              ) : (
                incident.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                      <span>{note.author_name}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600">{note.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="pt-2 border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record an investigation update or verification note..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
                />
                <button
                  type="submit"
                  disabled={submittingNote || !newNote.trim()}
                  className="px-4 py-2 bg-navy-800 hover:bg-navy-900 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
                >
                  Add Note
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Incident History Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <History className="w-4 h-4 text-navy-700" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Audit Timeline & Lifecycle
              </h3>
            </div>

            <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {incident.history?.map((hist) => (
                <div key={hist.id} className="relative text-xs">
                  <span className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-navy-600 ring-4 ring-white" />
                  <div className="font-semibold text-slate-900">{hist.action.replace(/_/g, ' ')}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{hist.details}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    By {hist.changed_by} • {new Date(hist.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              FinAssist 360 Unified Service Management Ledger
            </span>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Assign Incident</h3>
              <button onClick={() => setAssignModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleAssign} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assignee</label>
                <select
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                >
                  <option value={3}>Priya Sharma (Banking Support Agent)</option>
                  <option value={4}>David Chen (Technical Support Engineer)</option>
                  <option value={2}>Vikram Mehta (Service Manager)</option>
                  <option value={1}>Sarah Jenkins (Admin)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Department</label>
                <input
                  type="text"
                  value={assignDept}
                  onChange={(e) => setAssignDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-navy-800 text-white font-bold"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Resolve Incident Dossier</h3>
              <button onClick={() => setResolveModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleResolve} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verified Root Cause *</label>
                <textarea
                  rows={2}
                  required
                  value={rootCauseInput}
                  onChange={(e) => setRootCauseInput(e.target.value)}
                  placeholder="e.g. Transient NPCI Switch handshake timeout; confirmed ledger credit reversal."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 resize-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution & Closure Notes *</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotesInput}
                  onChange={(e) => setResolutionNotesInput(e.target.value)}
                  placeholder="Detail actions taken, customer communication, and verification."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Resolve & Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
