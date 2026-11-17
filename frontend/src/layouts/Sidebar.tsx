import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  AlertTriangle,
  FileText,
  Cpu,
  BookOpen,
  Activity,
  TrendingUp,
  GitMerge,
  BarChart3,
  ShieldAlert,
  Settings,
  Building2,
  CheckCircle2,
  Users,
  Shield,
  PlusCircle,
  Inbox,
  Bell,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hasModuleAccess, getRoleTheme, isCustomerUser } from '../utils/rbac';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const enterpriseNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/service-desk', label: 'AI Service Desk', icon: Bot, badge: 'GenAI' },
  { path: '/incidents', label: 'Incident Management', icon: AlertTriangle },
  { path: '/requests', label: 'Service Requests', icon: FileText },
  { path: '/agents', label: 'AI Agent Center', icon: Cpu, badge: '7 Agents' },
  { path: '/knowledge', label: 'Knowledge Base', icon: BookOpen, badge: 'RAG' },
  { path: '/operations', label: 'Banking Operations', icon: Activity },
  { path: '/predictions', label: 'Predictive Intelligence', icon: TrendingUp, badge: 'ML' },
  { path: '/workflows', label: 'Workflow Management', icon: GitMerge },
  { path: '/analytics', label: 'Analytics & Reports', icon: BarChart3 },
  { path: '/audit-logs', label: 'Audit Logs', icon: ShieldAlert },
  { path: '/users', label: 'User Management', icon: Users, badge: 'RBAC' },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const customerNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/raise-complaint', label: 'Raise a Complaint', icon: PlusCircle, badge: 'GenAI' },
  { path: '/my-complaints', label: 'My Complaints', icon: Inbox },
  { path: '/service-requests', label: 'Service Requests', icon: FileText },
  { path: '/ai-assistant', label: 'AI Banking Assistant', icon: Bot, badge: 'RAG' },
  { path: '/service-status', label: 'Banking Service Status', icon: Activity },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/profile', label: 'My Profile', icon: UserIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const roleTheme = getRoleTheme(user?.role);
  const isCustomer = isCustomerUser(user?.role);

  const displayNavItems = isCustomer
    ? customerNavItems
    : enterpriseNavItems.filter((item) => hasModuleAccess(user?.role, item.path));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-navy-950 tracking-tight leading-none">
                FinAssist <span className="text-navy-600">360</span>
              </h1>
              <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider mt-1">
                GenAI Banking USM
              </p>
            </div>
          </div>
        </div>

        {/* Active Role Indicator */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Shield className="w-3.5 h-3.5 text-navy-700 shrink-0" />
            <span className="text-xs font-bold text-slate-800 truncate">{user?.role || 'Super Admin'}</span>
          </div>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${roleTheme.badge}`}>
            {roleTheme.tag}
          </span>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
            <span>{isCustomer ? 'Customer Portal' : 'Core Modules'}</span>
            <span className="text-[10px] text-slate-400 font-mono font-normal">
              {displayNavItems.length} active
            </span>
          </div>
          {displayNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-navy-50 text-navy-800 font-semibold border-l-4 border-navy-700 shadow-xs'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-navy-700" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-navy-800">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* System Status Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span className="font-medium">{isCustomer ? 'Core Banking Link' : 'Core Banking Switch'}</span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> 99.98%
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[99.98%]" />
          </div>
          <div className="text-[10px] text-slate-600 mt-2 text-center font-medium">
            {isCustomer ? 'FinAssist 360 Customer Portal' : 'FinAssist 360 v1.0.0 Enterprise'}
          </div>
        </div>
      </aside>
    </>
  );
};
