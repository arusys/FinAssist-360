import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'priority' | 'service';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'status' }) => {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  const s = status.toLowerCase();

  // Priorities
  if (s.includes('p1') || s.includes('critical')) {
    colorStyles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (s.includes('p2') || s.includes('high')) {
    colorStyles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (s.includes('p3') || s.includes('medium')) {
    colorStyles = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (s.includes('p4') || s.includes('low')) {
    colorStyles = 'bg-slate-50 text-slate-600 border-slate-200';
  }
  // Incident Statuses
  else if (s === 'new') {
    colorStyles = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (s === 'assigned') {
    colorStyles = 'bg-sky-50 text-sky-700 border-sky-200';
  } else if (s === 'in progress') {
    colorStyles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (s === 'pending' || s === 'under review') {
    colorStyles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (s === 'resolved' || s === 'fulfilled' || s === 'approved' || s === 'operational') {
    colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (s === 'closed') {
    colorStyles = 'bg-slate-100 text-slate-600 border-slate-200';
  } else if (s === 'rejected' || s === 'outage') {
    colorStyles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (s === 'degraded') {
    colorStyles = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorStyles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {status}
    </span>
  );
};
