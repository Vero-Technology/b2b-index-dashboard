import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-800', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
