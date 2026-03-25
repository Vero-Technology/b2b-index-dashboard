import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Database,
  HardDrive,
  BarChart3,
} from 'lucide-react';
import { usePolling } from '../hooks/usePolling';
import { getScrapersGrouped, getTableCounts, getWorkers } from '../api/scrapers';
import { getDiskUsage } from '../api/indexes';
import { fetchSystemOverview } from '../api/system';
import { Card } from '../components/ui/Card';
import { GaugeBar } from '../components/ui/GaugeBar';
import { DatasetGroup } from '../components/scrapers/DatasetGroup';
import { POLL_INTERVALS } from '../lib/constants';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: datasets, isLoading: scrapersLoading } = usePolling(
    getScrapersGrouped,
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

      {/* Grouped scrapers */}
      <div>
        <h2 className="mb-4 font-display text-base font-semibold text-gray-800">
          Scrapers
        </h2>
        {scrapersLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            Loading scrapers...
          </div>
        ) : !datasets?.length ? (
          <Card>
            <div className="py-8 text-center text-sm text-gray-400">
              No scraper status data available
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {datasets.map((ds) => (
              <DatasetGroup
                key={ds.dataset}
                dataset={ds}
                onScraperClick={(source) => navigate(`/scrapers/${source}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Table counts */}
      {tableCounts && (
        <Card title="Table Row Counts">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Object.entries(tableCounts).map(([table, count]) => (
              <div key={table} className="rounded-lg bg-surface-950 p-3 border border-surface-700/50">
                <div className="font-mono text-[11px] text-gray-400">{table}</div>
                <div className="mt-1 font-mono text-lg font-semibold text-gray-800">
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
    <div className="rounded-xl border border-surface-700 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${accent ? 'bg-emerald-50 text-emerald-600' : 'bg-surface-800 text-gray-400'}`}>
          <Icon size={14} />
        </div>
        <span className="text-xs font-medium text-gray-400">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-bold text-gray-900">{value}</span>
        {sub && <span className="text-xs text-gray-400">{sub}</span>}
      </div>
    </div>
  );
}
