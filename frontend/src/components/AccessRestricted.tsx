import React from 'react';
import { ShieldAlert, ArrowLeft, RefreshCw, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AccessRestrictedProps {
  moduleName: string;
  requiredRoles: string[];
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  moduleName,
  requiredRoles
}) => {
  const { user, switchDemoRole } = useAuth();

  return (
    <div className="min-h-[420px] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg w-full p-6 sm:p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Access Restricted: {moduleName}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Your current persona (<strong className="text-navy-900">{user?.role}</strong>) does not have authorization to access this module under FinAssist 360 RBAC policy.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Authorized Enterprise Roles:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {requiredRoles.map((role) => (
              <span
                key={role}
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-slate-200 text-navy-800 shadow-2xs"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Quick 1-click persona switch to test authorized role */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
          </Link>
          {requiredRoles.length > 0 && (
            <button
              onClick={() => switchDemoRole(requiredRoles[0] as UserRole)}
              className="w-full sm:w-auto px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Key className="w-3.5 h-3.5" /> Switch to {requiredRoles[0]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
