import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ShieldAlert,
  RefreshCw,
  Check,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
}

export const CustomerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications?limit=50');
      setNotifications(res.data);
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const markAllRead = async () => {
    try {
      await Promise.all(
        notifications.filter((n) => !n.is_read).map((n) => api.post(`/notifications/${n.id}/read`))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  const displayed = filterUnread
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-navy-800" /> Notifications & Service Alerts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time confirmations, investigation handoffs, and banking service operational updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-50 hover:bg-navy-100 text-navy-900 text-xs font-bold rounded-lg border border-navy-200 transition-colors self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterUnread(false)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            !filterUnread ? 'bg-navy-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilterUnread(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterUnread ? 'bg-navy-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-navy-600" /> Loading notifications...
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No notifications found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {displayed.map((n) => {
            const isAlert = n.notification_type?.includes('ALERT') || n.notification_type?.includes('CRITICAL');
            const isResolution = n.notification_type?.includes('RESOLUTION');

            return (
              <div
                key={n.id}
                className={`p-4 transition-colors flex items-start justify-between gap-4 ${
                  !n.is_read ? 'bg-navy-50/40 border-l-4 border-navy-700' : 'hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isAlert ? 'bg-amber-100 text-amber-700' : (isResolution ? 'bg-emerald-100 text-emerald-700' : 'bg-navy-100 text-navy-800')
                  }`}>
                    {isAlert ? <AlertCircle className="w-4 h-4" /> : (isResolution ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-navy-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.entity_type === 'Complaint' && (
                    <Link
                      to="/my-complaints"
                      className="text-[11px] font-bold text-navy-700 hover:text-navy-900 flex items-center gap-1"
                    >
                      View Complaint <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                  {n.entity_type === 'ServiceRequest' && (
                    <Link
                      to="/service-requests"
                      className="text-[11px] font-bold text-navy-700 hover:text-navy-900 flex items-center gap-1"
                    >
                      View Request <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="px-2.5 py-1 text-[11px] bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-md transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
