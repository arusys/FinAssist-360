import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Server,
  Zap,
  Info
} from 'lucide-react';
import api from '../services/api';

interface ServiceStatusItem {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
  status: 'Operational' | 'Degraded' | 'Outage' | 'Maintenance';
  availability: number;
  sla_threshold: number;
}

export const BankingServiceStatus: React.FC = () => {
  const [services, setServices] = useState<ServiceStatusItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customer/service-status');
      setServices(res.data);
    } catch (e) {
      console.error('Failed to load service status', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-navy-800" /> Banking Services Status & Uptime
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time operational health, telemetry and uptime metrics for retail and inter-bank clearing switches.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Telemetry
        </button>
      </div>

      {/* Global Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-900">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <strong className="font-bold">Core Banking Platform Operational:</strong> All central settlement systems, ATM gateways, and immediate payment networks are processing within target SLA limits.
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-navy-600" /> Querying core switch availability...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => {
            const isOp = s.status === 'Operational';
            const isDegraded = s.status === 'Degraded';
            return (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {s.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isOp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      (isDegraded ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200')
                    }`}>
                      {s.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2">{s.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {s.description || 'Core customer transaction clearing channel.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Availability:</span>
                    <span className="font-mono font-bold text-navy-900">{s.availability}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isOp ? 'bg-emerald-500' : (isDegraded ? 'bg-amber-500' : 'bg-rose-500')}`}
                      style={{ width: `${Math.min(100, s.availability)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">SLA: {s.sla_threshold}%</span>
                    <Link
                      to="/raise-complaint"
                      className="text-[11px] font-bold text-navy-700 hover:text-navy-900 flex items-center gap-1"
                    >
                      <PlusCircle className="w-3 h-3" /> Report Issue
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Maintenance Schedule Advisory */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2 text-xs">
        <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-xs">
          <Info className="w-4 h-4 text-navy-700" /> Scheduled Banking Maintenance Window
        </h4>
        <p className="text-slate-600 leading-relaxed">
          The National Unified Payments Interface (UPI) switch performs routine inter-bank database indexing on Saturday between 02:00 AM – 03:30 AM IST. During this window, IMPS and NetBanking remain fully functional for fund transfers.
        </p>
      </div>
    </div>
  );
};
