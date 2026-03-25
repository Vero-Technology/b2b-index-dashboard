import { usePolling } from '../hooks/usePolling';
import {
  fetchSystemOverview,
  fetchPostgresStats,
  fetchCapacity,
  fetchDiskIO,
} from '../api/system';
import { GaugeBar } from '../components/ui/GaugeBar';
import { MetricCard } from '../components/ui/MetricCard';
import { Card } from '../components/ui/Card';
import {
  HardDrive,
  Cpu,
  MemoryStick,
  Database,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export default function SystemMonitor() {
  const { data: system } = usePolling(fetchSystemOverview, 5_000);
  const { data: postgres } = usePolling(fetchPostgresStats, 10_000);
  const { data: capacity } = usePolling(fetchCapacity, 15_000);
  const { data: io } = usePolling(fetchDiskIO, 5_000);

  if (!system) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        Loading system metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Capacity banner */}
      {capacity && (
        <div
          className={`rounded-lg border p-4 ${
            capacity.can_add_workers
              ? 'border-emerald-500/20 bg-emerald-500/5'
              : 'border-red-500/20 bg-red-500/5'
          }`}
        >
          <div className="mb-1 flex items-center gap-2">
            {capacity.can_add_workers ? (
              <CheckCircle size={18} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={18} className="text-red-400" />
            )}
            <span className="font-medium text-gray-200">
              {capacity.can_add_workers
                ? 'Capacity Available'
                : 'System Under Pressure'}
            </span>
          </div>
          <p className="text-sm text-gray-400">{capacity.recommendation}</p>
          {capacity.warnings.length > 0 && (
            <ul className="mt-2 space-y-1">
              {capacity.warnings.map((w, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1 text-xs text-amber-400"
                >
                  <AlertTriangle size={12} /> {w}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Top metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          title="Disk Free"
          value={`${system.disk.free_gb}GB`}
          subtitle={`${system.disk.used_gb} / ${system.disk.total_gb} GB`}
          icon={<HardDrive size={16} />}
          status={
            system.disk.percent > 85
              ? 'danger'
              : system.disk.percent > 70
                ? 'warn'
                : 'good'
          }
        />
        <MetricCard
          title="RAM Available"
          value={`${system.memory.available_gb}GB`}
          subtitle={`${system.memory.used_gb} / ${system.memory.total_gb} GB used`}
          icon={<MemoryStick size={16} />}
          status={
            system.memory.percent > 85
              ? 'danger'
              : system.memory.percent > 70
                ? 'warn'
                : 'good'
          }
        />
        <MetricCard
          title="CPU Load"
          value={`${system.cpu.avg_percent}%`}
          subtitle={`${system.cpu.cores} cores · Load: ${system.cpu.load_1m}`}
          icon={<Cpu size={16} />}
          status={
            system.cpu.avg_percent > 80
              ? 'danger'
              : system.cpu.avg_percent > 60
                ? 'warn'
                : 'good'
          }
        />
        <MetricCard
          title="PG Connections"
          value={postgres?.connections.active ?? '—'}
          subtitle={`${postgres?.connections.total ?? 0} total · ${postgres?.connections.idle ?? 0} idle`}
          icon={<Database size={16} />}
          status={
            (postgres?.connections.active ?? 0) > 10 ? 'warn' : 'good'
          }
        />
      </div>

      {/* Gauge bars */}
      <Card title="Resource Usage">
        <div className="space-y-4">
          <GaugeBar
            label="Disk"
            value={system.disk.percent}
            detail={`${system.disk.used_gb}GB / ${system.disk.total_gb}GB`}
          />
          <GaugeBar
            label="RAM"
            value={system.memory.percent}
            detail={`${system.memory.used_gb}GB / ${system.memory.total_gb}GB`}
          />
          <GaugeBar
            label="CPU"
            value={system.cpu.avg_percent}
            detail={`Load: ${system.cpu.load_1m} / ${system.cpu.load_5m} / ${system.cpu.load_15m}`}
          />
          {system.memory.swap_total_gb > 0 && (
            <GaugeBar
              label="Swap"
              value={
                (system.memory.swap_used_gb / system.memory.swap_total_gb) *
                100
              }
              detail={`${system.memory.swap_used_gb}GB / ${system.memory.swap_total_gb}GB`}
            />
          )}
        </div>
      </Card>

      {/* CPU per-core breakdown */}
      <Card title="CPU Cores">
        <div className="grid grid-cols-4 gap-2">
          {system.cpu.per_core_percent.map((pct, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-8 font-mono text-xs text-gray-500">
                C{i}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-800">
                <div
                  className={`h-full rounded-full ${
                    pct > 80
                      ? 'bg-red-500'
                      : pct > 50
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono text-xs text-gray-400">
                {pct}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Disk I/O */}
      {io && (
        <Card title="Disk I/O (cumulative since boot)">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-500">Read</span>
              <div className="font-mono text-lg text-gray-200">
                {io.read_gb} GB
              </div>
              <span className="text-xs text-gray-500">
                {io.read_count.toLocaleString()} ops
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500">Write</span>
              <div className="font-mono text-lg text-gray-200">
                {io.write_gb} GB
              </div>
              <span className="text-xs text-gray-500">
                {io.write_count.toLocaleString()} ops
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Postgres details */}
      {postgres && (
        <>
          <Card title="PostgreSQL">
            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div>
                <span className="text-xs text-gray-500">Cache Hit Ratio</span>
                <div
                  className={`font-mono text-lg ${
                    postgres.cache_hit_ratio_percent > 99
                      ? 'text-emerald-400'
                      : postgres.cache_hit_ratio_percent > 95
                        ? 'text-amber-400'
                        : 'text-red-400'
                  }`}
                >
                  {postgres.cache_hit_ratio_percent}%
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">WAL Size</span>
                <div className="font-mono text-lg text-gray-200">
                  {postgres.wal_gb} GB
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">shared_buffers</span>
                <div className="font-mono text-lg text-gray-200">
                  {postgres.shared_buffers}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">work_mem</span>
                <div className="font-mono text-lg text-gray-200">
                  {postgres.work_mem}
                </div>
              </div>
            </div>
          </Card>

          {/* Active queries */}
          {postgres.active_queries.length > 0 && (
            <Card title="Active Queries">
              <div className="space-y-2">
                {postgres.active_queries.map((q) => (
                  <div
                    key={q.pid}
                    className="rounded bg-surface-800 p-3 font-mono text-xs"
                  >
                    <div className="mb-1 flex justify-between">
                      <span className="text-amber-400">PID {q.pid}</span>
                      <span
                        className={
                          q.duration_sec > 60
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }
                      >
                        {q.duration_sec}s
                      </span>
                    </div>
                    <div className="break-all text-gray-300">
                      {q.query_preview}
                    </div>
                    {q.wait_event && (
                      <div className="mt-1 text-gray-500">
                        Wait: {q.wait_event_type}/{q.wait_event}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Vacuum stats */}
          {postgres.vacuum_stats.length > 0 && (
            <Card title="Tables with Dead Tuples" padding={false}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700/50 text-xs text-gray-500">
                    <th className="px-4 py-2 text-left">Table</th>
                    <th className="px-4 py-2 text-right">Dead Tuples</th>
                    <th className="px-4 py-2 text-right">Last Vacuum</th>
                  </tr>
                </thead>
                <tbody>
                  {postgres.vacuum_stats.map((v) => (
                    <tr
                      key={v.table}
                      className="border-b border-surface-800/50"
                    >
                      <td className="px-4 py-2 font-mono text-gray-300">
                        {v.table}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-amber-400">
                        {v.dead_tuples.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right text-xs text-gray-500">
                        {v.last_autovacuum
                          ? new Date(v.last_autovacuum).toLocaleDateString()
                          : 'never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
