import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Square, AlertTriangle } from 'lucide-react';
import { usePolling } from '../hooks/usePolling';
import { getScraperStatuses, getLogs, startScraper, stopScraper } from '../api/scrapers';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { LogViewer } from '../components/ui/LogViewer';
import { Card } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import { POLL_INTERVALS, SCRAPER_DISPLAY_NAMES } from '../lib/constants';
import { formatDate, progressPercent } from '../lib/utils';

export default function ScraperDetail() {
  const { source } = useParams<{ source: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);

  const { data: scrapers, refetch: refetchStatus } = usePolling(
    getScraperStatuses,
    POLL_INTERVALS.DASHBOARD
  );

  const { data: logs } = usePolling(
    useCallback(() => getLogs(source || '', 200), [source]),
    POLL_INTERVALS.LOGS,
    !!source
  );

  const scraper = scrapers?.find((s) => s.source === source);
  const displayName = SCRAPER_DISPLAY_NAMES[source || ''] || source;

  async function handleStart() {
    if (!source) return;
    setActionLoading(true);
    try {
      await startScraper(source);
      toast(`Started ${displayName}`, 'success');
      refetchStatus();
    } catch {
      toast(`Failed to start ${displayName}`, 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStop() {
    if (!source) return;
    if (!window.confirm(`Stop ${displayName}? This will kill the running process.`)) return;
    setActionLoading(true);
    try {
      await stopScraper(source);
      toast(`Stopped ${displayName}`, 'success');
      refetchStatus();
    } catch {
      toast(`Failed to stop ${displayName}`, 'error');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-surface-800 hover:text-gray-700"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="font-display text-lg font-semibold text-gray-900">
            {displayName}
          </h2>
          <div className="mt-0.5 font-mono text-xs text-gray-400">
            {scraper?.category || source}
          </div>
        </div>
        {scraper && <StatusBadge status={scraper.status} />}
      </div>

      {/* Status + controls */}
      {scraper && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatItem label="Scraped" value={scraper.total_scraped?.toLocaleString() ?? '0'} />
              <StatItem label="Expected" value={scraper.total_expected?.toLocaleString() ?? '—'} />
              <StatItem
                label="Failed"
                value={scraper.total_failed?.toLocaleString() ?? '0'}
                alert={!!scraper.total_failed}
              />
              <StatItem label="Updated" value={formatDate(scraper.updated_at)} />
            </div>
            <div className="mt-4">
              <ProgressBar value={progressPercent(scraper.total_scraped, scraper.total_expected)} />
            </div>
          </Card>

          <Card title="Controls">
            <div className="flex gap-2">
              <button
                onClick={handleStart}
                disabled={actionLoading || scraper.status === 'running'}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Play size={14} />
                Start
              </button>
              <button
                onClick={handleStop}
                disabled={actionLoading || scraper.status !== 'running'}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Square size={14} />
                Stop
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Logs */}
      <LogViewer
        lines={logs || []}
        isLive={scraper?.status === 'running'}
        maxHeight="32rem"
      />

      {/* Last error */}
      {scraper?.last_error && (
        <Card title="Last Error">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <pre className="whitespace-pre-wrap font-mono text-xs text-red-700">
              {scraper.last_error}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatItem({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] font-medium text-gray-400">{label}</div>
      <div className={`mt-0.5 font-mono text-lg font-semibold ${alert ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  );
}
