import { STATUS_CONFIG } from '../../lib/constants';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          config.dot,
          status === 'running' && 'animate-pulse'
        )}
      />
      {config.label}
    </span>
  );
}
