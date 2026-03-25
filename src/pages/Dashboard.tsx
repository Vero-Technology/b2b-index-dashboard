import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Database,
  HardDrive,
  BarChart3,
} from 'lucide-react';
import { usePolling } from '../hooks/usePolling';
import { getScraperStatuses, getTableCounts, getWorkers } from '../api/scrapers';
import { getDiskUsage } from '../api/indexes';
import { fetchSystemOverview } from '../api/system';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { GaugeBar } from '../components/ui/GaugeBar';
import { POLL_INTERVALS, SCRAPER_DISPLAY_NAMES } from '../lib/constants';
import { formatDate, progressPercent } from '../lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: scrapers, isLoading: scrapersLoading } = usePolling(
    getScraperStatuses,
    POLL_INTERVALS.DASHBOARD
  );

  const { data: tableCounts } = usePolling(
    getTableCounts,
    POLL_INTERVALS.DASHBOARD
  );

  const { data: workers } = usePolling(
    getWorkers,
    POLL_INTERVALS.DASHBOARD
  );

  const { data: disk } = usePolling(
    useCallback(() => getDiskUsage(), []),
    60_000
  );

  const { data: system } = usePolling(fetchSystemOverview, POLL_INTERVALS.DASHBOARD);

  const totalRecords = tableCounts
    ? Object.values(tableCounts).reduce((sum: number, v) => sum + (v || 0), 0)
    : 0;

  const activeWorkers = workers?.length ?? 0;

  const diskLine = disk?.[1] || '';
  const diskParts = diskLine.trim().split(/\s+/);
  const diskUsed = diskParts[2] || '—';
  const diskTotal = diskParts[1] || '—';

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Database}
          label="Total Records"
          value={totalRecords.toLocaleString()}
        />
        <SummaryCard
          icon={Activity}
          label="Active Workers"
          value={String(activeWorkers)}
          accent={activeWorkers > 0}
        />
        <SummaryCard
          icon={HardDrive}
          label="Disk Usage"
          value={diskUsed}
          sub={`of ${diskTotal}`}
        />
        <SummaryCard
          icon={BarChart3}
          label="Tables"
          value={tableCounts ? String(Object.keys(tableCounts).length) : '—'}
        />
      </div>

      {/* System gauges */}
      {system && (
        <div className="grid grid-cols-3 gap-4">
          <GaugeBar
            label="Disk"
            value={system.disk.percent}
            detail={`${system.disk.free_gb}GB free`}
          />
          <GaugeBar
            label="RAM"
            value={system.memory.percent}
            detail={`${system.memory.available_gb}GB free`}
          />
          <GaugeBar
            label="CPU"
            value={system.cpu.avg_percent}
            detail={`Load: ${system.cpu.load_1m}`}
          />
        </div>
      )}

      {/* Scraper status grid */}
      <div>
        <h2 className="mb-4 font-display text-base font-semibold text-gray-200">
          Scrapers
        </h2>
        {scrapersLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            Loading scrapers...
          </div>
        ) : !scrapers?.length ? (
          <Card>
            <div className="py-8 text-center text-sm text-gray-500">
              No scraper status data available
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {scrapers.map((s) => {
              const pct = progressPercent(s.total_scraped, s.total_expected);
              return (
                <button
                  key={s.source}
                  onClick={() => navigate(`/scrapers/${s.source}`)}
                  className="group rounded-lg border border-surface-700/50 bg-surface-900 p-4 text-left transition-all hover:border-amber-500/20 hover:bg-surface-800/80"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-200">
                        {SCRAPER_DISPLAY_NAMES[s.source] || s.source}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-gray-600">
                        {s.category || s.source}
                      </div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-lg font-semibold text-gray-100">
                        {s.total_scraped?.toLocaleString() ?? '0'}
                      </span>
                      {s.total_expected && (
                        <span className="font-mono text-xs text-gray-500">
                          / {s.total_expected.toLocaleString()} expected
                        </span>
                      )}
                    </div>
                    <ProgressBar value={pct} />
                  </div>

                  {s.total_failed ? (
                    <div className="mt-2 font-mono text-xs text-red-400">
                      {s.total_failed} failed
                    </div>
                  ) : null}

                  <div className="mt-3 text-[11px] text-gray-600">
                    Updated {formatDate(s.updated_at)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Table counts */}
      {tableCounts && (
        <Card title="Table Row Counts">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Object.entries(tableCounts).map(([table, count]) => (
              <div key={table} className="rounded-md bg-surface-800/50 p-3">
                <div className="font-mono text-[11px] text-gray-500">{table}</div>
                <div className="mt-1 font-mono text-lg font-semibold text-gray-200">
                  {count?.toLocaleString() ?? '—'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-surface-700/50 bg-surface-900 p-5">
      <div className="flex items-center gap-2">
        <Icon size={14} className={accent ? 'text-amber-400' : 'text-gray-500'} />
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-bold text-gray-100">{value}</span>
        {sub && <span className="text-xs text-gray-600">{sub}</span>}
      </div>
    </div>
  );
}
