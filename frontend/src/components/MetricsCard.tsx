import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  trend,
}) => {
  const variantStyles = {
    default: 'text-navy-700 bg-navy-50 border-navy-100',
    danger: 'text-rose-700 bg-rose-50 border-rose-100',
    warning: 'text-amber-700 bg-amber-50 border-amber-100',
    success: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    info: 'text-sky-700 bg-sky-50 border-sky-100',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${variantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtext && <div className="mt-2 text-xs text-slate-600">{subtext}</div>}
    </div>
  );
};
