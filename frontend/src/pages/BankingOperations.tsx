import React, { useState, useEffect } from 'react';
import {
  Activity,
  GitBranch,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Play,
  ArrowRight,
  Server,
  RefreshCw,
  Zap,
  Layers
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { BankingService, ServiceImpactResponse } from '../types';

export const BankingOperations: React.FC = () => {
  const [services, setServices] = useState<BankingService[]>([]);
  const [loading, setLoading] = useState(true);

  // Impact Simulation
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [simState, setSimState] = useState<'Outage' | 'Degraded'>('Outage');
  const [analyzing, setAnalyzing] = useState(false);
  const [impactResult, setImpactResult] = useState<ServiceImpactResponse | null>(null);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
      if (res.data.length > 0 && selectedServiceId === null) {
        setSelectedServiceId(res.data[0].id);
      }
    } catch (e) {
      console.error('Failed to load services', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSimulateImpact = async () => {
    if (!selectedServiceId) return;
    setAnalyzing(true);
    try {
      const res = await api.post('/services/impact-analysis', {
        service_id: selectedServiceId,
        simulated_failure_state: simState
      });
      setImpactResult(res.data);
    } catch (e) {
      console.error('Impact analysis failed', e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-navy-800 text-white flex items-center justify-center shadow-xs">
            <Activity className="w-5 h-5 text-navy-200" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Banking Operations & Dependency Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Simulated core banking service topologies, live availability telemetry & cross-service blast radius reasoning
            </p>
          </div>
        </div>
      </div>

      {/* 7 Core Services Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            onClick={() => setSelectedServiceId(s.id)}
            className={`bg-white rounded-xl border p-4 shadow-xs cursor-pointer transition-all ${
              selectedServiceId === s.id
                ? 'border-navy-600 ring-2 ring-navy-100'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">{s.code}</span>
              <StatusBadge status={s.status} type="service" />
            </div>

            <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{s.description}</p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Availability:</span>
              <span className="font-bold text-emerald-600">{s.availability}%</span>
            </div>

            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-500">Active Incidents:</span>
              <span className={`font-bold ${s.current_incident_count > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                {s.current_incident_count}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Cross-Service Dependency Topology Map (Visual) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-navy-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Cross-Service Dependency Topology Map
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">11 Active Inter-Service Hard & Soft Links</span>
        </div>

        {/* Visual Architecture Topology Diagram */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto">
          <div className="min-w-[650px] space-y-4">
            {/* Tier 1: Core Interchange */}
            <div className="flex justify-center">
              <div className="p-3 bg-white border-2 border-navy-700 rounded-lg shadow-xs text-center w-64">
                <div className="text-[10px] font-bold text-navy-600 uppercase">Acquiring Switch</div>
                <div className="text-xs font-bold text-navy-950">Payment Gateway Service</div>
                <div className="text-[10px] text-slate-500">Primary Tunnel to NPCI & Visa/Mastercard</div>
              </div>
            </div>

            {/* Connecting arrows */}
            <div className="flex justify-center text-slate-400 text-xs font-bold">
              ↓ [Hard Dependency: Settlement & Auth] ↓
            </div>

            {/* Tier 2: Transaction Engines */}
            <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto">
              <div className="p-3 bg-white border border-slate-300 rounded-lg shadow-xs text-center">
                <div className="text-[10px] font-bold text-blue-600 uppercase">Immediate Payments</div>
                <div className="text-xs font-bold text-slate-900">UPI Payment Service</div>
                <div className="text-[10px] text-slate-500">P2P, P2M & QR Channels</div>
              </div>
              <div className="p-3 bg-white border border-slate-300 rounded-lg shadow-xs text-center">
                <div className="text-[10px] font-bold text-purple-600 uppercase">Card Schemes</div>
                <div className="text-xs font-bold text-slate-900">Card Processing Service</div>
                <div className="text-[10px] text-slate-500">Debit & Credit Authorization</div>
              </div>
            </div>

            {/* Connecting arrows */}
            <div className="flex justify-center text-slate-400 text-xs font-bold">
              ↓ [Soft/Hard Dependency: Customer Touchpoints] ↓
            </div>

            {/* Tier 3: Customer Channels & Terminals */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-2.5 bg-white border border-slate-300 rounded-lg shadow-xs text-center">
                <div className="text-[10px] font-bold text-emerald-600 uppercase">Digital Mobile</div>
                <div className="text-xs font-bold text-slate-900">Mobile Banking</div>
                <div className="text-[10px] text-slate-500">iOS & Android Apps</div>
              </div>
              <div className="p-2.5 bg-white border border-slate-300 rounded-lg shadow-xs text-center">
                <div className="text-[10px] font-bold text-amber-600 uppercase">Physical Terminals</div>
                <div className="text-xs font-bold text-slate-900">ATM Network</div>
                <div className="text-[10px] text-slate-500">1,850+ Cash Terminals</div>
              </div>
              <div className="p-2.5 bg-white border border-slate-300 rounded-lg shadow-xs text-center">
                <div className="text-[10px] font-bold text-sky-600 uppercase">Digital Web</div>
                <div className="text-xs font-bold text-slate-900">Internet Banking</div>
                <div className="text-[10px] text-slate-500">2FA Web Portal</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Service Impact Simulator */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Cross-Service Impact Analysis Engine (Section 13)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Traverses dependency blast radius & estimates cascading operational damage
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Target Service to Analyze
            </label>
            <select
              value={selectedServiceId || ''}
              onChange={(e) => setSelectedServiceId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Simulated Disruption State
            </label>
            <select
              value={simState}
              onChange={(e) => setSimState(e.target.value as 'Outage' | 'Degraded')}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
            >
              <option value="Outage">Complete Outage (100% Packet Drop)</option>
              <option value="Degraded">Degraded Latency (&gt;1,200ms)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSimulateImpact}
              disabled={analyzing || !selectedServiceId}
              className="w-full flex items-center justify-center gap-2 py-2 bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Analyze Impact & Mitigations
            </button>
          </div>
        </div>

        {/* Impact Analysis Results */}
        {impactResult && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
            {/* Impact Banner */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              impactResult.impact_severity === 'Critical'
                ? 'bg-rose-50 border-rose-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <ShieldAlert className={`w-5 h-5 shrink-0 ${
                impactResult.impact_severity === 'Critical' ? 'text-rose-600' : 'text-amber-600'
              }`} />
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Cascading Impact Severity: {impactResult.impact_severity}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {impactResult.ai_impact_narrative}
                </p>
              </div>
            </div>

            {/* Blast Radius Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Direct and Downstream */}
              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
                  Downstream Blast Radius (Direct Dependents):
                </span>
                {impactResult.indirect_dependents.length === 0 ? (
                  <div className="text-slate-500">No dependent downstream services found.</div>
                ) : (
                  <ul className="space-y-1 text-slate-700">
                    {impactResult.indirect_dependents.map((dep, idx) => (
                      <li key={idx} className="flex items-center gap-2 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{dep}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Impaired Business Operations */}
              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
                  Impaired Banking Business Operations:
                </span>
                <ul className="space-y-1 text-slate-700">
                  {impactResult.affected_operations.map((op, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{op}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Mitigations */}
            <div className="bg-navy-50/50 rounded-xl border border-navy-200 p-4">
              <span className="font-bold text-navy-950 uppercase text-[10px] tracking-wider block mb-2">
                AI Recommended Coordinated Mitigations:
              </span>
              <ul className="space-y-1.5 text-xs text-navy-900">
                {impactResult.recommended_mitigations.map((mit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-navy-700 shrink-0 mt-0.5" />
                    <span>{mit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
