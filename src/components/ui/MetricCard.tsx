import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  status?: 'good' | 'warn' | 'danger';
}

const BORDER: Record<string, string> = {
  good: 'border-emerald-200',
  warn: 'border-amber-200',
  danger: 'border-red-200',
};

const VALUE_COLOR: Record<string, string> = {
  good: 'text-emerald-700',
  warn: 'text-amber-700',
  danger: 'text-red-700',
};

const ICON_BG: Record<string, string> = {
  good: 'bg-emerald-50 text-emerald-600',
  warn: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  status = 'good',
}: MetricCardProps) {
  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${BORDER[status]}`}>
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
        {icon && (
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${ICON_BG[status]}`}>
            {icon}
          </div>
        )}
        <span>{title}</span>
      </div>
      <div className={`font-mono text-2xl font-bold ${VALUE_COLOR[status]}`}>
        {value}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-gray-400">{subtitle}</div>
      )}
    </div>
  );
}
