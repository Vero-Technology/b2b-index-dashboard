interface GaugeBarProps {
  label: string;
  value: number;
  detail: string;
  thresholds?: { warn: number; danger: number };
}

export function GaugeBar({
  label,
  value,
  detail,
  thresholds = { warn: 70, danger: 85 },
}: GaugeBarProps) {
  const color =
    value >= thresholds.danger
      ? 'bg-red-500'
      : value >= thresholds.warn
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="font-mono text-xs text-gray-400">{detail}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
