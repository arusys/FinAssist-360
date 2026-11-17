import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
  RefreshCw,
  BarChart2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap,
  Activity,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MetricsCard } from '../components/MetricsCard';
import { Prediction, ModelMetrics, BankingService } from '../types';

export const PredictiveIntelligence: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [services, setServices] = useState<BankingService[]>([]);
  const [loading, setLoading] = useState(true);

  // Run prediction
  const [targetServiceId, setTargetServiceId] = useState<number>(1);
  const [runningInference, setRunningInference] = useState(false);
  const [activeInference, setActiveInference] = useState<Prediction | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, predsRes, servRes] = await Promise.all([
        api.get('/predictions/metrics'),
        api.get('/predictions'),
        api.get('/services')
      ]);
      setMetrics(metricsRes.data);
      setPredictions(predsRes.data);
      setServices(servRes.data);
      if (servRes.data.length > 0) {
        setTargetServiceId(servRes.data[0].id);
      }
    } catch (e) {
      console.error('Failed to load predictive data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunInference = async () => {
    setRunningInference(true);
    setNotification(null);
    try {
      const res = await api.post<Prediction>(`/predictions/run?service_id=${targetServiceId}`);
      const newPrediction = res.data;
      setActiveInference(newPrediction);
      setPredictions((prev) => [newPrediction, ...prev.filter((p) => p.id !== newPrediction.id)]);
      setNotification(`Predictive inference completed for ${newPrediction.service_name}: Risk evaluated at ${(newPrediction.recurrence_risk_score * 100).toFixed(1)}% (${newPrediction.risk_level})`);
      setTimeout(() => setNotification(null), 6000);
    } catch (e) {
      console.error('Inference run failed', e);
      setNotification('Failed to execute predictive inference. Check server logs.');
    } finally {
      setRunningInference(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-navy-600" /> Loading predictive intelligence model...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-navy-800 text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-5 h-5 text-navy-200" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Predictive Incident Intelligence (ML)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Scikit-learn Random Forest classifier predicting operational recurrence probability & high-risk failure patterns
            </p>
          </div>
        </div>
      </div>

      {/* Model Performance Evaluation Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricsCard
          title="Model Accuracy"
          value={`${(metrics.accuracy * 100).toFixed(1)}%`}
          icon={ShieldCheck}
          variant="success"
          subtext="Test set evaluation metric"
        />
        <MetricsCard
          title="Precision Score"
          value={`${(metrics.precision * 100).toFixed(1)}%`}
          icon={BarChart2}
          subtext="True positive recurrence rate"
        />
        <MetricsCard
          title="Recall Score"
          value={`${(metrics.recall * 100).toFixed(1)}%`}
          icon={Cpu}
          subtext="Sensitivity across failure clusters"
        />
        <MetricsCard
          title="F1-Score"
          value={`${(metrics.f1_score * 100).toFixed(1)}%`}
          icon={Sparkles}
          variant="default"
          subtext={`${metrics.total_training_samples} training samples`}
        />
      </div>

      {/* Interactive Inference Trigger Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-navy-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              On-Demand Service Risk Prediction Engine
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Model: {metrics.model_name}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Banking Service for Recurrence Assessment
            </label>
            <select
              value={targetServiceId}
              onChange={(e) => setTargetServiceId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunInference}
            disabled={runningInference}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-navy-800 hover:bg-navy-900 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
          >
            {runningInference ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            Run Predictive Inference
          </button>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">×</button>
          </div>
        )}
      </div>

      {/* Prominent Live Inference Result Showcase */}
      {activeInference && (
        <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-slate-900 rounded-xl p-6 text-white shadow-md border border-navy-700 space-y-5 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-navy-700/60">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Live Inference Result Generated
              </span>
              <span className="text-navy-300 text-xs">•</span>
              <span className="text-xs font-semibold text-white">{activeInference.service_name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-navy-300">
                Confidence: <strong className="text-white">{(activeInference.confidence_score * 100).toFixed(0)}%</strong>
              </span>
              <button
                onClick={() => setActiveInference(null)}
                className="text-[10px] text-navy-300 hover:text-white px-2 py-0.5 rounded bg-navy-800/80 hover:bg-navy-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recurrence Risk Meter */}
            <div className="bg-navy-800/60 rounded-xl p-4 border border-navy-700/70 flex flex-col justify-between">
              <div className="text-[11px] text-navy-300 uppercase font-semibold">Recurrence Risk</div>
              <div className="my-2">
                <div className="text-3xl font-black font-mono tracking-tight text-white">
                  {(activeInference.recurrence_risk_score * 100).toFixed(1)}%
                </div>
                {/* Visual Bar */}
                <div className="w-full bg-navy-950/80 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      activeInference.risk_level === 'Critical' ? 'bg-rose-500' :
                      activeInference.risk_level === 'High' ? 'bg-amber-400' :
                      activeInference.risk_level === 'Medium' ? 'bg-blue-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, activeInference.recurrence_risk_score * 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-[10px] text-navy-300">Random Forest Classifier Probability</div>
            </div>

            {/* Risk Tier Badge */}
            <div className="bg-navy-800/60 rounded-xl p-4 border border-navy-700/70 flex flex-col justify-between">
              <div className="text-[11px] text-navy-300 uppercase font-semibold">Risk Classification</div>
              <div className="my-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border ${
                  activeInference.risk_level === 'Critical' ? 'bg-rose-950/80 text-rose-300 border-rose-500/50' :
                  activeInference.risk_level === 'High' ? 'bg-amber-950/80 text-amber-300 border-amber-500/50' :
                  activeInference.risk_level === 'Medium' ? 'bg-blue-950/80 text-blue-300 border-blue-500/50' :
                  'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                  {activeInference.risk_level} Risk Tier
                </span>
              </div>
              <div className="text-[10px] text-navy-300">Operational SLA Impact Category</div>
            </div>

            {/* Predicted Recurrence Cadence */}
            <div className="bg-navy-800/60 rounded-xl p-4 border border-navy-700/70 flex flex-col justify-between">
              <div className="text-[11px] text-navy-300 uppercase font-semibold">Expected Recurrence</div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-1">
                  ~{activeInference.predicted_frequency_days} <span className="text-xs text-navy-300 font-sans font-normal">days</span>
                </div>
              </div>
              <div className="text-[10px] text-navy-300">Mean Time Between Recurring Disruptions</div>
            </div>

            {/* Target Service Quicklink */}
            <div className="bg-navy-800/60 rounded-xl p-4 border border-navy-700/70 flex flex-col justify-between">
              <div className="text-[11px] text-navy-300 uppercase font-semibold">Service Operations</div>
              <div className="my-2 text-xs text-navy-200">
                Cross-service dependency topology & real-time telemetry ready for review.
              </div>
              <Link
                to="/operations"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-navy-700 hover:bg-navy-650 text-white rounded-lg text-xs font-semibold transition-colors w-full"
              >
                <Activity className="w-3.5 h-3.5" /> View Service Topology
              </Link>
            </div>
          </div>

          {/* Root Driver and Mitigations Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-navy-950/60 rounded-lg p-3.5 border border-navy-800">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Primary Identified Failure Driver
              </div>
              <p className="text-xs text-navy-100 leading-relaxed font-mono">
                {activeInference.primary_failure_driver}
              </p>
            </div>

            <div className="bg-navy-950/60 rounded-lg p-3.5 border border-navy-800">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Engineering Mitigations
              </div>
              <p className="text-xs text-navy-100 leading-relaxed">
                {activeInference.recommended_preventive_actions}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Operational Recurrence Risk Assessments
          </h3>
          <span className="text-xs text-slate-500 font-medium">Scikit-learn Model Predictions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Service Name</th>
                <th className="py-3 px-4 text-center">Recurrence Risk</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4">Predicted Frequency</th>
                <th className="py-3 px-4">Primary Failure Driver</th>
                <th className="py-3 px-4">Recommended Actions</th>
                <th className="py-3 px-4 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {predictions.map((p) => {
                const isCrit = p.risk_level === 'Critical';
                const isHigh = p.risk_level === 'High';
                const isNewlyGenerated = activeInference?.id === p.id;
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isNewlyGenerated
                        ? 'bg-navy-50/80 border-l-4 border-navy-700'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span>{p.service_name}</span>
                      {isNewlyGenerated && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-navy-800 text-white px-1.5 py-0.5 rounded shadow-xs">
                          NEW
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                      <span className={isCrit ? 'text-rose-600' : (isHigh ? 'text-amber-600' : 'text-slate-700')}>
                        {(p.recurrence_risk_score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCrit ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        (isHigh ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700')
                      }`}>
                        {p.risk_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      ~Every {p.predicted_frequency_days} Days
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-600 truncate">
                      {p.primary_failure_driver}
                    </td>
                    <td className="py-3 px-4 max-w-sm text-slate-600 truncate">
                      {p.recommended_preventive_actions}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-navy-800">
                      {(p.confidence_score * 100).toFixed(0)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
