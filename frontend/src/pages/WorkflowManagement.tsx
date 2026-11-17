import React, { useState, useEffect } from 'react';
import {
  GitMerge,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  ChevronRight,
  ShieldAlert,
  Lock
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { WorkflowDefinition, WorkflowExecution, Approval } from '../types';
import { canApproveWorkflows } from '../utils/rbac';

export const WorkflowManagement: React.FC = () => {
  const { user } = useAuth();
  const [definitions, setDefinitions] = useState<WorkflowDefinition[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval modal
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [decisionType, setDecisionType] = useState<'Approve' | 'Reject'>('Approve');
  const [decisionReason, setDecisionReason] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [defsRes, execsRes, appRes] = await Promise.all([
        api.get('/workflows/definitions'),
        api.get('/workflows/executions'),
        api.get('/workflows/approvals')
      ]);
      setDefinitions(defsRes.data);
      setExecutions(execsRes.data);
      setApprovals(appRes.data);
    } catch (e) {
      console.error('Failed to load workflow data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval) return;
    setSubmittingDecision(true);
    try {
      await api.post(`/workflows/approvals/${selectedApproval.id}/action`, {
        approved: decisionType === 'Approve',
        decision_reason: decisionReason
      });
      setSelectedApproval(null);
      setDecisionReason('');
      fetchData();
    } catch (e) {
      console.error('Approval action failed', e);
    } finally {
      setSubmittingDecision(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-navy-800 text-white flex items-center justify-center shadow-xs">
            <GitMerge className="w-5 h-5 text-navy-200" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Visual Workflow Automation & Approvals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Deterministic stage progression, human-in-the-loop approvals & department handoffs
            </p>
          </div>
        </div>
      </div>

      {/* Pending Approvals Gate */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-navy-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Pending Human Approval Queue (Sensitive Actions)
            </h3>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            {approvals.filter((a) => a.status === 'PENDING').length} Pending Manager Review
          </span>
        </div>

        {approvals.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">
            No pending approvals currently queued.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {approvals.map((app) => (
              <div key={app.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="font-mono text-navy-800">{app.entity_ref}</span>
                    <span>•</span>
                    <span>{app.action_requested.replace(/_/g, ' ')}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      app.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      (app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{app.description}</p>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Required Role: {app.required_role} • {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </div>

                {app.status === 'PENDING' && (
                  canApproveWorkflows(user?.role) ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedApproval(app);
                          setDecisionType('Approve');
                          setDecisionReason('Verified against CBS switch ledger timeout.');
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApproval(app);
                          setDecisionType('Reject');
                          setDecisionReason('Insufficient documentation provided.');
                        }}
                        className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[11px] font-medium border border-slate-200 shrink-0">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Approval requires Operations Manager</span>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visual Workflow Definitions */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Enterprise Banking Workflow Definitions & Stage Pipelines
        </h3>

        <div className="space-y-4">
          {definitions.map((wf) => (
            <div key={wf.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{wf.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{wf.description}</p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-navy-50 text-navy-800 px-2 py-1 rounded">
                  {wf.code}
                </span>
              </div>

              {/* Horizontal Stages Visual Bar */}
              <div className="pt-2 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-[700px]">
                  {wf.stages.map((stage, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Stage {sIdx + 1}</div>
                        <div className="text-xs font-semibold text-slate-800 mt-0.5 truncate">{stage}</div>
                      </div>
                      {sIdx < wf.stages.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-scaleIn">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
              Confirm {decisionType} for {selectedApproval.entity_ref}
            </h3>
            <form onSubmit={handleDecision} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recorded Decision Justification *
                </label>
                <textarea
                  rows={3}
                  required
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="State operational reason for audit logs..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedApproval(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDecision}
                  className={`px-4 py-1.5 rounded-lg font-bold text-white ${
                    decisionType === 'Approve' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {submittingDecision ? 'Processing...' : `Confirm ${decisionType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
