import React, { useState } from 'react';
import { AgentStepResult } from '../types';
import {
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Cpu,
  FileSearch,
  Database,
  GitBranch,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';

interface AgentPipelineViewerProps {
  steps: AgentStepResult[];
  totalDurationMs?: number;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  'Customer Request Understanding Agent': <MessageSquare className="w-4 h-4 text-blue-600" />,
  'Incident Classification Agent': <ShieldAlert className="w-4 h-4 text-purple-600" />,
  'Transaction Analysis Agent': <Database className="w-4 h-4 text-emerald-600" />,
  'Knowledge Retrieval Agent': <FileSearch className="w-4 h-4 text-amber-600" />,
  'Root Cause Analysis Agent': <GitBranch className="w-4 h-4 text-rose-600" />,
  'Workflow Coordination Agent': <Cpu className="w-4 h-4 text-indigo-600" />,
  'Resolution Assistant Agent': <CheckCircle2 className="w-4 h-4 text-teal-600" />,
};

export const AgentPipelineViewer: React.FC<AgentPipelineViewerProps> = ({
  steps,
  totalDurationMs,
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleStep = (stepOrder: number) => {
    setExpandedStep(expandedStep === stepOrder ? null : stepOrder);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-navy-700" />
          <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
            Multi-Agent Orchestration Execution Trace
          </h3>
          <span className="text-xs bg-navy-100 text-navy-800 font-semibold px-2 py-0.5 rounded-full">
            {steps.length} Specialized Agents
          </span>
        </div>
        {totalDurationMs !== undefined && (
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pipeline Runtime: {totalDurationMs.toFixed(1)} ms
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {steps.map((step) => {
          const isExpanded = expandedStep === step.step_order;
          const icon = AGENT_ICONS[step.agent_name] || <Cpu className="w-4 h-4 text-slate-500" />;

          return (
            <div key={step.step_order} className="transition-colors hover:bg-slate-50/50">
              <button
                onClick={() => toggleStep(step.step_order)}
                className="w-full text-left p-4 flex items-center justify-between focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                    {step.step_order}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{step.agent_name}</span>
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {step.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{step.agent_role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {step.execution_time_ms} ms
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 bg-slate-50/70 border-t border-slate-100 space-y-2">
                  {step.input_summary && (
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Agent Input Summary: </span>
                      {step.input_summary}
                    </div>
                  )}

                  <div className="mt-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Structured Agent Output:
                    </span>
                    <pre className="text-xs bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto font-mono max-h-56 leading-relaxed">
                      {JSON.stringify(step.output_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
