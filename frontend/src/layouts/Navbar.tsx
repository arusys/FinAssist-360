import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, User as UserIcon, ShieldCheck, LogOut, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole, Notification } from '../types';
import api from '../services/api';

interface NavbarProps {
  onMenuToggle: () => void;
}

const ROLES: UserRole[] = [
  'Super Admin',
  'Service Desk Agent',
  'Banking Operations Manager',
  'Technical Support Engineer',
  'Operations Analyst',
  'User'
];

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications?limit=6');
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: Notification) => !n.is_read).length);
      } catch (e) {
        console.warn('Notifications fetch failed', e);
      }
    };
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Search incident number, RRN, customer, or banking service..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Role Switcher & User Profile */}
      <div className="flex items-center gap-3">
        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-navy-700" />
            <span className="hidden md:inline text-slate-600">Role:</span>
            <span className="font-semibold text-navy-900">{user?.role || 'Admin'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
                Switch Demo Persona
              </div>
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    switchDemoRole(role);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    user?.role === role ? 'font-bold text-navy-700 bg-navy-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{role}</span>
                  {user?.role === role && <Check className="w-3.5 h-3.5 text-navy-700" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="font-semibold text-xs text-navy-950 uppercase tracking-wider">
                  Operational Alerts
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-navy-600 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-600">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs transition-colors ${
                        !n.is_read ? 'bg-navy-50/30' : 'bg-white'
                      }`}
                    >
                      <div className="font-semibold text-slate-800 flex items-center justify-between">
                        <span>{n.title}</span>
                        {!n.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-navy-600" />
                        )}
                      </div>
                      <p className="text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {user?.full_name?.split(' ')[0] || 'User'}
            </div>
            <div className="text-[10px] text-slate-600 leading-none">
              {user?.department || 'Operations'}
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg ml-1 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
