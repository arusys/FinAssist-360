import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileText,
  Activity,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Download,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import api from '../services/api';
import { MetricsCard } from '../components/MetricsCard';
import { StatusBadge } from '../components/StatusBadge';
import { AnalyticsDashboard, Incident } from '../types';
import { useAuth } from '../context/AuthContext';
import { isCustomerUser } from '../utils/rbac';
import { CustomerDashboard } from './CustomerDashboard';

const SEVERITY_COLORS: Record<string, string> = {
  'P1 – Critical': '#ef4444',
  'P2 – High': '#f59e0b',
  'P3 – Medium': '#3b82f6',
  'P4 – Low': '#94a3b8',
};

const CATEGORY_COLORS = ['#1e40af', '#3b82f6', '#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // If active role is Customer (User), render the dedicated Customer Portal Dashboard
  if (isCustomerUser(user?.role)) {
    return <CustomerDashboard />;
  }

  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, incidentsRes] = await Promise.all([
        api.get('/dashboard/analytics'),
        api.get('/incidents?limit=6')
      ]);
      setData(analyticsRes.data);
      setRecentIncidents(incidentsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-navy-600 animate-spin" />
          <span className="text-sm font-medium text-slate-600">Loading banking operations metrics...</span>
        </div>
      </div>
    );
  }

  const { summary } = data;

  const filteredIncidents = selectedCategoryFilter === 'all'
    ? recentIncidents
    : recentIncidents.filter((inc) => inc.category === selectedCategoryFilter);

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Banking Operations Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time Unified Service Management (USM) telemetry & AI incident coordination
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <a
            href="/api/incidents/export/csv"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Data
          </a>
        </div>
      </div>

      {/* Critical Alert Banner if P1 incidents exist */}
      {summary.critical_incidents > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-rose-900">
              {summary.critical_incidents} High-Priority Service Disruption Active
            </h4>
            <p className="text-xs text-rose-700 mt-0.5">
              Payment Gateway acquiring switch latency is currently propagating to downstream UPI and Card Processing services. Coordinated mitigation in progress.
            </p>
          </div>
          <Link
            to="/operations"
            className="text-xs font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            Impact Analysis →
          </Link>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Incidents"
          value={summary.total_incidents}
          icon={AlertTriangle}
          subtext="Cumulative logged tickets"
          trend={{ value: "+12% this week" }}
        />
        <MetricsCard
          title="Open Incidents"
          value={summary.open_incidents}
          icon={Clock}
          variant={summary.open_incidents > 5 ? "warning" : "default"}
          subtext={`${summary.critical_incidents} marked Critical P1`}
        />
        <MetricsCard
          title="Pending Requests"
          value={summary.pending_service_requests}
          icon={FileText}
          subtext="Internal staff & IT workflows"
        />
        <MetricsCard
          title="SLA Compliance"
          value={`${summary.sla_compliance_percentage}%`}
          icon={ShieldCheck}
          variant="success"
          subtext={`Avg MTTR: ${summary.average_resolution_time_hours} hrs`}
          trend={{ value: "Target: 95%", isPositive: true }}
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Incident Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                7-Day Incident Velocity & Resolution Trend
              </h3>
              <p className="text-xs text-slate-500">Comparison of newly created vs resolved incidents</p>
            </div>
            <span className="text-xs text-emerald-600 bg-emerald-50 font-semibold px-2 py-1 rounded">
              MTBF: {data.mtbf_days} Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" name="Logged Incidents" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" name="Resolved Incidents" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Donut Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              Incidents by Severity Tier
            </h3>
            <p className="text-xs text-slate-500 mb-4">Priority classification distribution</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.incidents_by_severity}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {data.incidents_by_severity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {data.incidents_by_severity.map((item) => (
              <div key={item.severity} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[item.severity] || '#64748b' }} />
                <span className="text-slate-600 truncate">{item.severity.split('–')[0]}</span>
                <span className="font-bold text-slate-800 ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Workload & Banking Categories Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Banking Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
            Incidents by Banking Category
          </h3>
          <p className="text-xs text-slate-500 mb-4">Volume distribution across operational domains</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.incidents_by_category} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#1b3b6b" radius={[4, 4, 0, 0]} name="Incident Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Workload Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              Department Operations Workload
            </h3>
            <p className="text-xs text-slate-500 mb-4">Current load and resolution capability</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-100 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Active</th>
                  <th className="py-2.5 px-3 text-center">Resolved</th>
                  <th className="py-2.5 px-3 text-right">Load Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.department_workload.map((dw) => (
                  <tr key={dw.department} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-medium text-slate-900 truncate max-w-[180px]">{dw.department}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-amber-600">{dw.active_incidents}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{dw.resolved_incidents}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dw.active_incidents > 3 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {dw.active_incidents > 3 ? 'High Load' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Incidents Table with Category Filter */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Banking Service Incidents
            </h3>
            <p className="text-xs text-slate-500">Live feed from central Unified Service Management ledger</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-navy-600"
            >
              <option value="all">All Categories</option>
              {data.incidents_by_category.map((c) => (
                <option key={c.category} value={c.category}>{c.category}</option>
              ))}
            </select>
            <Link
              to="/incidents"
              className="text-xs font-semibold text-navy-700 hover:text-navy-900 hover:underline px-2"
            >
              View All ({summary.total_incidents}) →
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-navy-800">
                    <Link to={`/incidents/${inc.id}`} className="hover:underline">
                      {inc.incident_number}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                    {inc.title}
                  </td>
                  <td className="py-3 px-4 text-slate-600 truncate">{inc.category}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={inc.priority} type="priority" />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={inc.status} />
                  </td>
                  <td className="py-3 px-4 text-slate-600 truncate">{inc.assigned_department}</td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/incidents/${inc.id}`}
                      className="px-2.5 py-1 text-[11px] font-semibold text-navy-700 bg-navy-50 hover:bg-navy-100 rounded border border-navy-200 transition-colors"
                    >
                      Inspect
                    </Link>
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
