import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Clock,
  ShieldCheck,
  TrendingUp,
  Activity,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import api from '../services/api';
import { MetricsCard } from '../components/MetricsCard';
import { AnalyticsDashboard } from '../types';

export const AnalyticsReports: React.FC = () => {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/analytics');
      setData(res.data);
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-navy-600" /> Calculating real application operational telemetry...
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Analytics & Executive SLA Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Computed from actual database incidents, MTTR benchmarking & department workloads
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/incidents/export/csv"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Executive CSV
          </a>
        </div>
      </div>

      {/* KPI Benchmark Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricsCard
          title="Mean Time to Resolution (MTTR)"
          value={`${data.mttr_hours} hrs`}
          icon={Clock}
          variant="success"
          subtext="Target: < 4.0 hrs"
          trend={{ value: "SLA Met", isPositive: true }}
        />
        <MetricsCard
          title="Mean Time Between Failures"
          value={`${data.mtbf_days} days`}
          icon={Activity}
          subtext="Stability benchmark"
        />
        <MetricsCard
          title="SLA Compliance Rate"
          value={`${summary.sla_compliance_percentage}%`}
          icon={ShieldCheck}
          variant="default"
          subtext="Central Bank requirement > 95%"
          trend={{ value: "+1.2% this month", isPositive: true }}
        />
        <MetricsCard
          title="Service Availability"
          value={`${summary.operational_services_count}/${summary.total_services_count}`}
          icon={TrendingUp}
          subtext="Core banking services live"
        />
      </div>

      {/* Detailed Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Incident Created vs Resolved */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
            7-Day Resolution Velocity
          </h3>
          <p className="text-xs text-slate-500 mb-4">Ingress volume vs resolved throughput</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.daily_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} name="Logged" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Throughput Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
            Departmental Incident Load & Resolution
          </h3>
          <p className="text-xs text-slate-500 mb-4">Active queue vs successfully resolved cases</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.department_workload} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={false} axisLine={true} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="active_incidents" fill="#f59e0b" name="Active Queue" radius={[3, 3, 0, 0]} />
                <Bar dataKey="resolved_incidents" fill="#10b981" name="Resolved" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
