import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function ProgressBar({ value, size = 'md', className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const height = size === 'sm' ? 'h-1' : 'h-1.5';

  return (
    <div className={cn(`${height} w-full overflow-hidden rounded-full bg-surface-800`, className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-600 transition-all duration-500 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
