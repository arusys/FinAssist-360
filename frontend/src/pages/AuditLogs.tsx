import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Server
} from 'lucide-react';
import api from '../services/api';
import { AuditLog } from '../types';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = filterAction ? `/audit-logs?action=${filterAction}` : '/audit-logs';
      const res = await api.get(url);
      setLogs(res.data);
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-navy-800 text-white flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-5 h-5 text-navy-200" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              System Audit Logs & Security Trails
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Immutable operational records of authentication, incident updates, workflow approvals & AI tool executions
            </p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="">All Operational Actions</option>
            <option value="USER_LOGIN">User Logins</option>
            <option value="INCIDENT_CREATED">Incident Creation</option>
            <option value="AI_AGENT_PIPELINE_EXECUTED">AI Agent Pipelines</option>
            <option value="WORKFLOW_APPROVAL_APPROVED">Approvals Granted</option>
            <option value="KNOWLEDGE_DOC_UPLOADED">Document Ingestion</option>
          </select>

          {filterAction && (
            <button
              onClick={() => setFilterAction('')}
              className="text-xs text-rose-600 hover:underline px-2"
            >
              Clear Filter
            </button>
          )}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {logs.length} Audit Events Recorded
        </span>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-navy-600" /> Loading security audit trails...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor / Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity Ref</th>
                  <th className="py-3 px-4">Audit Details</th>
                  <th className="py-3 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 font-mono text-[11px]">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-slate-900">{log.username}</div>
                      <div className="text-[10px] text-navy-600 font-semibold">{log.user_role}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-navy-800">
                      {log.entity_id || log.entity_type || 'SYSTEM'}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 max-w-sm truncate">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {log.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
