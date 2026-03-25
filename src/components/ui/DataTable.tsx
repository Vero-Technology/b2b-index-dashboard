import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  mono?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  page,
  totalPages,
  total,
  onPageChange,
  isLoading,
  emptyMessage = 'No data',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent mr-2" />
        Loading...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">{emptyMessage}</div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-700/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-gray-500',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className="border-b border-surface-800/50 transition-colors hover:bg-surface-800/30"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-2.5 text-gray-300',
                      col.mono && 'font-mono text-xs',
                      col.className
                    )}
                  >
                    {col.render
                      ? col.render(row)
                      : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {page !== undefined && totalPages !== undefined && onPageChange && (
        <div className="flex items-center justify-between border-t border-surface-700/50 px-4 py-3">
          <span className="text-xs text-gray-500">
            {total !== undefined ? `${total.toLocaleString()} total` : `Page ${page} of ${totalPages}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-surface-700 hover:text-gray-200 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-mono text-xs text-gray-400">
              {page}/{totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-surface-700 hover:text-gray-200 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
