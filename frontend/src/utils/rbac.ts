import { UserRole } from '../types';

export interface NavItemConfig {
  path: string;
  label: string;
  iconName: string;
  badge?: string;
  allowedRoles: string[];
}

export const MODULE_PERMISSIONS: Record<string, string[]> = {
  '/': ['Super Admin', 'Service Desk Agent', 'Banking Operations Manager', 'Technical Support Engineer', 'Operations Analyst', 'User', 'Admin', 'Service Manager', 'Banking Support Agent'],
  '/service-desk': ['Super Admin', 'Service Desk Agent', 'Banking Operations Manager', 'Technical Support Engineer', 'Admin', 'Service Manager', 'Banking Support Agent', 'User', 'Customer'],
  '/incidents': ['Super Admin', 'Service Desk Agent', 'Banking Operations Manager', 'Technical Support Engineer', 'Admin', 'Service Manager', 'Banking Support Agent'],
  '/requests': ['Super Admin', 'Service Desk Agent', 'Banking Operations Manager', 'Admin', 'Service Manager', 'Banking Support Agent'],
  '/agents': ['Super Admin', 'Service Desk Agent', 'Admin', 'Banking Support Agent'],
  '/knowledge': ['Super Admin', 'Service Desk Agent', 'Banking Operations Manager', 'Technical Support Engineer', 'Operations Analyst', 'Admin', 'Service Manager', 'Banking Support Agent'],
  '/operations': ['Super Admin', 'Banking Operations Manager', 'Technical Support Engineer', 'Operations Analyst', 'Admin', 'Service Manager'],
  '/predictions': ['Super Admin', 'Operations Analyst', 'Banking Operations Manager', 'Admin'],
  '/workflows': ['Super Admin', 'Banking Operations Manager', 'Admin', 'Service Manager'],
  '/analytics': ['Super Admin', 'Banking Operations Manager', 'Operations Analyst', 'Admin', 'Service Manager'],
  '/audit-logs': ['Super Admin', 'Operations Analyst', 'Admin'],
  '/users': ['Super Admin', 'Admin'],
  '/settings': ['Super Admin', 'Admin'],
  '/raise-complaint': ['User', 'Super Admin'],
  '/my-complaints': ['User', 'Super Admin'],
  '/service-requests': ['User', 'Super Admin'],
  '/ai-assistant': ['User', 'Super Admin'],
  '/service-status': ['User', 'Super Admin'],
  '/notifications': ['User', 'Super Admin', 'Service Desk Agent', 'Banking Operations Manager', 'Technical Support Engineer', 'Operations Analyst'],
  '/profile': ['User', 'Super Admin', 'Service Desk Agent', 'Banking Operations Manager', 'Technical Support Engineer', 'Operations Analyst']
};

export const normalizeRole = (role?: string): string => {
  if (!role) return 'Service Desk Agent';
  if (role === 'Admin') return 'Super Admin';
  if (role === 'Service Manager') return 'Banking Operations Manager';
  if (role === 'Banking Support Agent') return 'Service Desk Agent';
  if (role === 'User' || role === 'Customer') return 'User';
  return role;
};

export const hasModuleAccess = (userRole?: string, path?: string): boolean => {
  if (!userRole || !path) return false;
  const normRole = normalizeRole(userRole);
  if (normRole === 'Super Admin') return true;

  // Exact or base path match
  const basePath = '/' + (path.split('/')[1] || '');
  const allowed = MODULE_PERMISSIONS[basePath];
  if (!allowed) return true;

  return allowed.includes(normRole) || allowed.includes(userRole);
};

export const canApproveWorkflows = (userRole?: string): boolean => {
  const norm = normalizeRole(userRole);
  return norm === 'Super Admin' || norm === 'Banking Operations Manager';
};

export const canManageUsers = (userRole?: string): boolean => {
  const norm = normalizeRole(userRole);
  return norm === 'Super Admin';
};

export const canAssignIncidents = (userRole?: string): boolean => {
  const norm = normalizeRole(userRole);
  return norm === 'Super Admin' || norm === 'Banking Operations Manager' || norm === 'Service Desk Agent';
};

export const canResolveIncidents = (userRole?: string): boolean => {
  const norm = normalizeRole(userRole);
  return norm === 'Super Admin' || norm === 'Banking Operations Manager' || norm === 'Technical Support Engineer';
};

export const isCustomerUser = (role?: string): boolean => {
  return normalizeRole(role) === 'User';
};

export const getRoleTheme = (role?: string) => {
  const norm = normalizeRole(role);
  switch (norm) {
    case 'Super Admin':
      return { badge: 'bg-rose-50 text-rose-700 border-rose-200', tag: 'Full Governance' };
    case 'Banking Operations Manager':
      return { badge: 'bg-amber-50 text-amber-700 border-amber-200', tag: 'Service & Approvals' };
    case 'Service Desk Agent':
      return { badge: 'bg-blue-50 text-blue-700 border-blue-200', tag: 'Customer Frontline' };
    case 'Technical Support Engineer':
      return { badge: 'bg-purple-50 text-purple-700 border-purple-200', tag: 'Diagnostic & Resolution' };
    case 'Operations Analyst':
      return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', tag: 'Telemetry & ML' };
    case 'User':
      return { badge: 'bg-teal-50 text-teal-700 border-teal-200', tag: 'Customer Portal' };
    default:
      return { badge: 'bg-slate-50 text-slate-700 border-slate-200', tag: 'Enterprise Member' };
  }
};
