import { STATUS_CONFIG } from '../../lib/constants';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-mono font-medium',
        size === 'sm' ? 'px-1.5 py-px text-[10px]' : 'px-2.5 py-0.5 text-xs',
        config.bg,
        config.text,
        className
      )}
    >
      <span
        className={cn(
          'rounded-full',
          size === 'sm' ? 'h-1 w-1' : 'h-1.5 w-1.5',
          config.dot,
          status === 'running' && 'animate-pulse'
        )}
      />
      {config.label}
    </span>
  );
}
