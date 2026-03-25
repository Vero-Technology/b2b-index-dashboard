import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  status?: 'good' | 'warn' | 'danger';
}

const BORDER: Record<string, string> = {
  good: 'border-emerald-500/30',
  warn: 'border-amber-500/30',
  danger: 'border-red-500/30',
};

const VALUE_COLOR: Record<string, string> = {
  good: 'text-emerald-400',
  warn: 'text-amber-400',
  danger: 'text-red-400',
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  status = 'good',
}: MetricCardProps) {
  return (
    <div className={`rounded-lg border bg-surface-900 p-4 ${BORDER[status]}`}>
      <div className="mb-1 flex items-center gap-2 text-sm text-gray-400">
        {icon}
        <span>{title}</span>
      </div>
      <div className={`font-mono text-2xl font-bold ${VALUE_COLOR[status]}`}>
        {value}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
      )}
    </div>
  );
}
