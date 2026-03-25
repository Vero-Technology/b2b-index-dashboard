import { useState } from 'react';
import { ChevronDown, ChevronRight, Database } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { ProgressBar } from '../ui/ProgressBar';
import type { ScraperGrouped, SubCategory as SubCategoryType } from '../../types/api';
import { formatDate } from '../../lib/utils';

interface DatasetGroupProps {
  dataset: ScraperGrouped;
  onScraperClick?: (source: string) => void;
}

export function DatasetGroup({ dataset, onScraperClick }: DatasetGroupProps) {
  const [expanded, setExpanded] = useState(true);
  const progress =
    dataset.totals.expected > 0
      ? Math.round((dataset.totals.scraped / dataset.totals.expected) * 100)
      : 0;

  const hasRunning = dataset.sub_categories.some((sub) =>
    sub.scrapers.some((s) => s.status === 'running')
  );

  return (
    <div className="overflow-hidden rounded-lg border border-surface-700/50">
      {/* Dataset header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between bg-surface-900 p-4 transition-colors hover:bg-surface-800"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown size={18} className="text-gray-500" />
          ) : (
            <ChevronRight size={18} className="text-gray-500" />
          )}
          <Database size={18} className="text-amber-400" />
          <span className="font-display font-semibold text-gray-100">
            {dataset.dataset}
          </span>
          {hasRunning && <StatusBadge status="running" size="sm" />}
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-gray-300">
            {dataset.totals.scraped.toLocaleString()} /{' '}
            {dataset.totals.expected.toLocaleString()}
          </span>
          <div className="w-32">
            <ProgressBar value={progress} />
          </div>
          <span className="w-12 text-right font-mono text-xs text-gray-500">
            {progress}%
          </span>
        </div>
      </button>

      {/* Sub-categories */}
      {expanded && (
        <div className="divide-y divide-surface-800/50">
          {dataset.sub_categories.map((sub) => (
            <SubCategoryGroup
              key={sub.sub_category}
              sub={sub}
              onScraperClick={onScraperClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubCategoryGroup({
  sub,
  onScraperClick,
}: {
  sub: SubCategoryType;
  onScraperClick?: (source: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const progress =
    sub.totals.expected > 0
      ? Math.round((sub.totals.scraped / sub.totals.expected) * 100)
      : 0;
  const hasRunning = sub.scrapers.some((s) => s.status === 'running');
  const dataSource = sub.scrapers[0]?.data_source || '';

  return (
    <div className="bg-surface-950">
      {/* Sub-category header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-3 transition-colors hover:bg-surface-900/50"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown size={14} className="text-gray-500" />
          ) : (
            <ChevronRight size={14} className="text-gray-500" />
          )}
          <span className="text-sm font-medium text-gray-200">
            {sub.sub_category}
          </span>
          {dataSource && (
            <span className="rounded bg-surface-800 px-2 py-0.5 text-xs text-gray-400">
              {dataSource}
            </span>
          )}
          {hasRunning && <StatusBadge status="running" size="sm" />}
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-gray-400">
            {sub.totals.scraped.toLocaleString()} /{' '}
            {sub.totals.expected.toLocaleString()}
          </span>
          <div className="w-24">
            <ProgressBar value={progress} size="sm" />
          </div>
          <span className="w-12 text-right font-mono text-xs text-gray-500">
            {sub.scrapers.length} job{sub.scrapers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </button>

      {/* Individual scrapers table */}
      {expanded && (
        <div className="px-6 pb-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-800 text-xs text-gray-500">
                <th className="py-1.5 text-left font-normal">Source</th>
                <th className="py-1.5 text-right font-normal">Scraped</th>
                <th className="py-1.5 text-right font-normal">Expected</th>
                <th className="py-1.5 text-center font-normal">Status</th>
                <th className="py-1.5 text-right font-normal">Updated</th>
              </tr>
            </thead>
            <tbody>
              {sub.scrapers.map((s) => (
                <tr
                  key={s.source}
                  className="cursor-pointer border-b border-surface-800/50 hover:bg-surface-900/30"
                  onClick={() => onScraperClick?.(s.source)}
                >
                  <td className="py-1.5 font-mono text-xs text-gray-300">
                    {s.source}
                  </td>
                  <td className="py-1.5 text-right font-mono text-gray-200">
                    {(s.total_scraped || 0).toLocaleString()}
                  </td>
                  <td className="py-1.5 text-right font-mono text-gray-400">
                    {(s.total_expected || 0).toLocaleString()}
                  </td>
                  <td className="py-1.5 text-center">
                    <StatusBadge status={s.status} size="sm" />
                  </td>
                  <td className="py-1.5 text-right text-xs text-gray-500">
                    {s.updated_at ? formatDate(s.updated_at) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
