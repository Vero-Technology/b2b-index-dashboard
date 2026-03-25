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
        'rounded-xl border border-surface-700 bg-white shadow-sm',
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-surface-700 px-5 py-3">
          <h3 className="font-display text-sm font-medium text-gray-800">{title}</h3>
          {action}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
    </div>
  );
}
