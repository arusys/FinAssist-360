import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  GitBranch,
  Database,
  FileSearch,
  ShieldAlert,
  MessageSquare,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { AgentPipelineViewer } from '../components/AgentPipelineViewer';
import { AgentOrchestrationResponse } from '../types';

const AGENT_CATALOG = [
  {
    id: 1,
    name: "Customer Request Understanding Agent",
    role: "Intent Recognition & Entity Extraction",
    status: "Healthy",
    avgLatency: "14ms",
    description: "Extracts banking transaction identifiers (RRN), merchant entities, currency amounts, and maps customer complaint intent.",
    icon: MessageSquare,
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    id: 2,
    name: "Incident Classification Agent",
    role: "Severity & Priority Determination",
    status: "Healthy",
    avgLatency: "8ms",
    description: "Applies deterministic banking operational criteria to classify incidents into P1-P4 tiers and routes to target engineering department.",
    icon: ShieldAlert,
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    id: 3,
    name: "Transaction Analysis Agent",
    role: "Core Ledger & Switch Audit",
    status: "Healthy",
    avgLatency: "22ms",
    description: "Audits simulated core banking system transaction records, checks switch response codes, and detects duplicate sequence anomalies.",
    icon: Database,
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    id: 4,
    name: "Knowledge Retrieval Agent (RAG)",
    role: "Policy, SOP & SLA Verification",
    status: "Healthy",
    avgLatency: "38ms",
    description: "Performs semantic vector search against institutional banking SOPs and Central Banking directives for factual grounding.",
    icon: FileSearch,
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200"
  },
  {
    id: 5,
    name: "Root Cause Analysis Agent",
    role: "Dependency Graph & Blast Radius Reasoner",
    status: "Healthy",
    avgLatency: "18ms",
    description: "Traces cross-service dependency topologies to uncover upstream switch timeouts or hardware subsystem failures.",
    icon: GitBranch,
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200"
  },
  {
    id: 6,
    name: "Workflow Coordination Agent",
    role: "Task Decomposition & Approval Gatekeeper",
    status: "Healthy",
    avgLatency: "11ms",
    description: "Decomposes incidents into department tasks, enforces human approval gates for high-value financial actions (> ₹50,000).",
    icon: Cpu,
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  {
    id: 7,
    name: "Resolution Assistant Agent",
    role: "Empathetic Communication & Case Closure",
    status: "Healthy",
    avgLatency: "16ms",
    description: "Drafts transparent, empathetic customer communication with official incident tracking numbers and troubleshooting steps.",
    icon: CheckCircle2,
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200"
  }
];

export const AIAgentCenter: React.FC = () => {
  const [testQuery, setTestQuery] = useState(
    "My card was debited for INR 4,299 at Flipkart but transaction timed out. RRN9928340192."
  );
  const [running, setRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<AgentOrchestrationResponse | null>(null);
  const [pastExecutions, setPastExecutions] = useState<any[]>([]);

  const fetchExecutions = async () => {
    try {
      const res = await api.get('/ai/conversations?limit=5');
      setPastExecutions(res.data);
    } catch (e) {
      console.warn('Failed to load past executions', e);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, []);

  const handleRunOrchestration = async () => {
    if (!testQuery.trim()) return;
    setRunning(true);
    try {
      const res = await api.post('/ai/chat', {
        message: testQuery,
        customer_id: 'CUST-DEMO-AGENT'
      });
      setExecutionResult(res.data);
      fetchExecutions();
    } catch (e) {
      console.error('Orchestration failed', e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-navy-800 text-white flex items-center justify-center shadow-xs">
            <Cpu className="w-5 h-5 text-navy-200" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              AI Agent Center & Multi-Agent Orchestration
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Coordinated mesh of 7 specialized banking agents with deterministic state passing & approval safety
            </p>
          </div>
        </div>
      </div>

      {/* 7 Specialized Agents Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {AGENT_CATALOG.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-navy-700" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${agent.badgeColor}`}>
                    Agent {agent.id}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{agent.name}</h3>
                <div className="text-[11px] font-semibold text-navy-700 mt-0.5">{agent.role}</div>
                <p className="text-[11px] text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {agent.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {agent.status}
                </span>
                <span className="text-slate-400 font-mono">Avg: {agent.avgLatency}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Orchestrator Sandbox */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-navy-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Interactive Multi-Agent Orchestration Sandbox
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Executes pipeline sequentially: Agent 1 → Agent 2 → ... → Agent 7
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Test Input Complaint Query
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
            />
            <button
              onClick={handleRunOrchestration}
              disabled={running}
              className="flex items-center justify-center gap-2 px-5 py-2 bg-navy-800 hover:bg-navy-900 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
            >
              {running ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Executing 7 Agents...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Trigger Agent Pipeline
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Execution Trace */}
        {executionResult && (
          <div className="pt-2">
            <AgentPipelineViewer
              steps={executionResult.steps}
              totalDurationMs={executionResult.total_execution_time_ms}
            />
          </div>
        )}
      </div>

      {/* Recent Execution History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Recent Multi-Agent Pipeline Executions
          </h3>
          <span className="text-xs text-slate-500 font-medium">Logged in database</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Session ID</th>
                <th className="py-2.5 px-4">Input Query</th>
                <th className="py-2.5 px-4 text-center">Agents Ran</th>
                <th className="py-2.5 px-4 text-center">Duration</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pastExecutions.map((pe) => (
                <tr key={pe.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-mono font-bold text-navy-800">{pe.session_id}</td>
                  <td className="py-2.5 px-4 max-w-sm truncate text-slate-900">{pe.query}</td>
                  <td className="py-2.5 px-4 text-center font-bold text-navy-700">{pe.total_agents}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-slate-500">{pe.duration_ms} ms</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {pe.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400 whitespace-nowrap">
                    {new Date(pe.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
