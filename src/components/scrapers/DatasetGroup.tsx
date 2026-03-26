import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Database, StickyNote } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { ProgressBar } from '../ui/ProgressBar';
import { updateNotes } from '../../api/scrapers';
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
      ? Math.round((dataset.totals.unique ?? dataset.totals.scraped) / dataset.totals.expected * 100)
      : 0;

  const hasRunning = dataset.sub_categories.some((sub) =>
    sub.scrapers.some((s) => s.status === 'running')
  );

  return (
    <div className="overflow-hidden rounded-xl border border-surface-700 shadow-sm">
      {/* Dataset header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between bg-white p-4 transition-colors hover:bg-surface-950"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown size={18} className="text-gray-400" />
          ) : (
            <ChevronRight size={18} className="text-gray-400" />
          )}
          <Database size={18} className="text-accent" />
          <span className="font-display font-semibold text-gray-900">
            {dataset.dataset}
          </span>
          {hasRunning && <StatusBadge status="running" size="sm" />}
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-gray-600">
            {(dataset.totals.unique ?? dataset.totals.scraped).toLocaleString()} unique
          </span>
          <div className="w-32">
            <ProgressBar value={progress} />
          </div>
          <span className="w-12 text-right font-mono text-xs text-gray-400">
            {progress}%
          </span>
        </div>
      </button>

      {/* Sub-categories */}
      {expanded && (
        <div className="divide-y divide-surface-700/50">
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
  const uniqueCount = sub.unique ?? sub.totals.scraped;
  const progress =
    sub.totals.expected > 0
      ? Math.round((uniqueCount / sub.totals.expected) * 100)
      : 0;
  const hasRunning = sub.scrapers.some((s) => s.status === 'running');
  const dataSource = sub.scrapers[0]?.data_source || '';

  return (
    <div className="bg-surface-950">
      {/* Sub-category header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-3 transition-colors hover:bg-surface-800/50"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown size={14} className="text-gray-400" />
          ) : (
            <ChevronRight size={14} className="text-gray-400" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {sub.sub_category}
          </span>
          {dataSource && (
            <span className="rounded-md bg-surface-800 px-2 py-0.5 text-xs text-gray-500">
              {dataSource}
            </span>
          )}
          {hasRunning && <StatusBadge status="running" size="sm" />}
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-gray-500">
            {(sub.unique ?? sub.totals.scraped).toLocaleString()} /{' '}
            {sub.totals.expected.toLocaleString()}
          </span>
          <div className="w-24">
            <ProgressBar value={progress} size="sm" />
          </div>
          <span className="w-12 text-right font-mono text-xs text-gray-400">
            {sub.scrapers.length} job{sub.scrapers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </button>

      {/* Individual scrapers table */}
      {expanded && (
        <div className="px-6 pb-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700 text-xs text-gray-400">
                <th className="py-1.5 text-left font-normal">Source</th>
                <th className="py-1.5 text-right font-normal">Scraped</th>
                <th className="py-1.5 text-right font-normal">Expected</th>
                <th className="py-1.5 text-right font-normal">Unique</th>
                <th className="py-1.5 text-center font-normal">Status</th>
                <th className="py-1.5 text-center font-normal">Notes</th>
                <th className="py-1.5 text-right font-normal">Updated</th>
              </tr>
            </thead>
            <tbody>
              {sub.scrapers.map((s) => (
                <ScraperRow key={s.source} scraper={s} onScraperClick={onScraperClick} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ScraperRow({
  scraper: s,
  onScraperClick,
}: {
  scraper: import('../../types/api').ScraperStatus;
  onScraperClick?: (source: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(s.notes || '');
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [editing]);

  const handleSave = async () => {
    setEditing(false);
    if (notes !== (s.notes || '')) {
      setSaving(true);
      try {
        await updateNotes(s.source, notes);
        s.notes = notes;
      } catch {
        setNotes(s.notes || '');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <tr className="border-b border-surface-800/50 hover:bg-surface-800/30">
      <td
        className="py-1.5 font-mono text-xs text-gray-700 cursor-pointer"
        onClick={() => onScraperClick?.(s.source)}
      >
        <div>{s.source}</div>
        {s.description && (
          <div className="mt-0.5 font-sans text-[10px] text-gray-400 leading-tight">
            {s.description}
          </div>
        )}
      </td>
      <td className="py-1.5 text-right font-mono text-gray-800">
        <div>{(s.total_scraped || 0).toLocaleString()}</div>
        {s.breakdown && (
          <div className="text-[10px] text-gray-400">
            {s.breakdown.primary_unit}
          </div>
        )}
      </td>
      <td className="py-1.5 text-right font-mono text-gray-500">
        {(s.total_expected || 0).toLocaleString()}
      </td>
      <td className="py-1.5 text-right font-mono text-emerald-700 font-medium">
        {s.unique_contribution != null ? s.unique_contribution.toLocaleString() : '—'}
      </td>
      <td className="py-1.5 text-center">
        <StatusBadge status={s.status} size="sm" />
      </td>
      <td className="py-1.5 text-center max-w-[200px]">
        {editing ? (
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setNotes(s.notes || ''); setEditing(false); }
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
            }}
            className="w-full rounded border border-accent/30 bg-white px-2 py-1 text-xs text-gray-700 outline-none focus:border-accent resize-none"
            rows={2}
          />
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            title="Click to edit notes"
          >
            {saving ? (
              <span className="text-[10px] text-accent">saving...</span>
            ) : notes ? (
              <span className="text-gray-600 text-left max-w-[180px] truncate block">{notes}</span>
            ) : (
              <StickyNote size={12} className="opacity-40" />
            )}
          </button>
        )}
      </td>
      <td className="py-1.5 text-right text-xs text-gray-400">
        {s.updated_at ? formatDate(s.updated_at) : '—'}
      </td>
    </tr>
  );
}
