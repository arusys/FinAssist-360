import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  PlusCircle,
  Bot,
  Bell,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MetricsCard } from '../components/MetricsCard';

interface CustomerDashboardState {
  stats: {
    total_complaints: number;
    open_complaints: number;
    resolved_complaints: number;
    pending_service_requests: number;
  };
  recent_complaints: Array<{
    id: number;
    incident_number: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    service_name: string;
    created_at: string;
    resolved_at?: string;
  }>;
  recent_notifications: Array<{
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  }>;
  banking_service_status: Array<{
    id: number;
    name: string;
    code: string;
    category: string;
    status: string;
    availability: number;
    sla_threshold: number;
  }>;
}

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CustomerDashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickProblem, setQuickProblem] = useState('');
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickSuccess, setQuickSuccess] = useState<string | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customer/dashboard');
      setData(res.data);
    } catch (e) {
      console.error('Failed to load customer dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = quickProblem.trim();
    if (!text) return;
    setQuickSubmitting(true);
    setQuickError(null);
    setQuickSuccess(null);
    try {
      const res = await api.post('/customer/complaints', {
        description: text
      });
      setQuickSuccess(`Complaint submitted successfully! Reference: ${res.data.complaint_id}`);
      setQuickProblem('');
      fetchDashboard();
    } catch (err: any) {
      setQuickError(err?.response?.data?.detail || 'Failed to submit problem. Please try again.');
    } finally {
      setQuickSubmitting(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-navy-600" /> Loading your customer service dashboard...
      </div>
    );
  }

  const { stats, recent_complaints, recent_notifications, banking_service_status } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded-md border border-teal-800">
            Customer Self-Service Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-2">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Customer'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Track your complaints, request banking services, monitor live core switches, and get instant answers from our AI Banking Assistant.
          </p>
        </div>

        {/* Quick Action CTA buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/raise-complaint"
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Raise a Complaint
          </Link>
          <Link
            to="/ai-assistant"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-all backdrop-blur-sm"
          >
            <Bot className="w-4 h-4 text-teal-300" /> AI Assistant
          </Link>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Complaints"
          value={stats.total_complaints.toString()}
          icon={AlertCircle}
          variant="default"
          subtext="Cumulative lodged"
        />
        <MetricsCard
          title="Open Complaints"
          value={stats.open_complaints.toString()}
          icon={Clock}
          variant={stats.open_complaints > 0 ? "warning" : "default"}
          subtext="Under active review"
        />
        <MetricsCard
          title="Resolved Complaints"
          value={stats.resolved_complaints.toString()}
          icon={CheckCircle2}
          variant="success"
          subtext="Rectified by bank"
        />
        <MetricsCard
          title="Pending Requests"
          value={stats.pending_service_requests.toString()}
          icon={FileText}
          variant="default"
          subtext="Card & access requests"
        />
      </div>

      {/* Quick Problem Submission Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quick Submit a Banking Problem
            </h3>
          </div>
          <Link
            to="/raise-complaint"
            className="text-[11px] font-semibold text-navy-700 hover:text-navy-900 flex items-center gap-1"
          >
            Open Full Form <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {quickSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{quickSuccess}</span>
          </div>
        )}

        {quickError && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{quickError}</span>
          </div>
        )}

        <form onSubmit={handleQuickSubmit} className="mt-3 space-y-3">
          <div className="relative">
            <textarea
              rows={2}
              value={quickProblem}
              onChange={(e) => setQuickProblem(e.target.value)}
              placeholder="Describe what occurred (e.g. ₹2,000 debited from ATM without cash, or UPI payment failed at store)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setQuickProblem("UPI payment of ₹1,500 debited from account but merchant payment failed.")}
                className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
              >
                + UPI Failed
              </button>
              <button
                type="button"
                onClick={() => setQuickProblem("ATM deducted ₹5,000 but did not dispense cash at terminal.")}
                className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
              >
                + ATM No Cash
              </button>
              <button
                type="button"
                onClick={() => setQuickProblem("Charged twice for the same card transaction of ₹2,499.")}
                className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
              >
                + Double Charge
              </button>
            </div>

            <button
              type="submit"
              disabled={quickSubmitting || !quickProblem.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-navy-800 hover:bg-navy-900 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              {quickSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting Problem...
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" /> Submit Problem Instantly
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2-Column Grid: Recent Complaints & Service Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Complaints */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  My Recent Complaints
                </h3>
                <p className="text-[11px] text-slate-500">Live timeline & investigation progression</p>
              </div>
              <Link
                to="/my-complaints"
                className="text-xs font-semibold text-navy-700 hover:text-navy-900 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recent_complaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                You have not submitted any banking complaints yet.
                <div className="mt-3">
                  <Link
                    to="/raise-complaint"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-800 text-white rounded-lg text-xs font-semibold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Submit a Complaint
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recent_complaints.map((c) => {
                  const isResolved = c.status === 'Resolved' || c.status === 'Closed';
                  const isInProgress = c.status === 'In Progress' || c.status === 'Assigned';
                  return (
                    <Link
                      key={c.id}
                      to="/my-complaints"
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors block"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-navy-800">
                            {c.incident_number}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isResolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            (isInProgress ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700')
                          }`}>
                            {c.status}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">• {c.service_name}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">{c.title}</h4>
                        <div className="text-[10px] text-slate-500">
                          Category: {c.category} • Submitted on {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-navy-700 font-semibold group-hover:underline flex items-center">
                          Track Details <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Access Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/service-requests"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs flex items-start gap-3 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Banking Service Requests</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Request Card Support, Account Assistance, or Mobile App device reset.
                </p>
              </div>
            </Link>

            <Link
              to="/ai-assistant"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs flex items-start gap-3 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">24/7 AI Banking Guide</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Instant transaction policy advice grounded in official banking knowledge.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Banking Service Status & Recent Notifications */}
        <div className="space-y-6">
          {/* Live Banking Service Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-navy-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Banking Switches
                </h3>
              </div>
              <Link to="/service-status" className="text-[11px] text-navy-700 font-semibold hover:underline">
                Details
              </Link>
            </div>

            <div className="space-y-2">
              {banking_service_status.slice(0, 5).map((s) => {
                const isOp = s.status === 'Operational';
                return (
                  <div key={s.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{s.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Uptime: {s.availability}%</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isOp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-navy-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Recent Alerts & Updates
                </h3>
              </div>
              <Link to="/notifications" className="text-[11px] text-navy-700 font-semibold hover:underline">
                All
              </Link>
            </div>

            {recent_notifications.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                No active notifications.
              </div>
            ) : (
              <div className="space-y-2">
                {recent_notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div className="font-bold text-slate-900">{n.title}</div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
