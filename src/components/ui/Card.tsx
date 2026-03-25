import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ title, action, children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-surface-700/50 bg-surface-900',
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-surface-700/50 px-5 py-3">
          <h3 className="font-display text-sm font-medium text-gray-300">{title}</h3>
          {action}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
    </div>
  );
}
