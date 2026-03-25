import { useState, useEffect, useCallback } from 'react';
import { usePolling } from '../hooks/usePolling';
import {
  fetchWorkerRegistry,
  fetchActiveWorkers,
  launchWorker,
  stopWorker,
  clearWorker,
  fetchWorkerLogs,
  fetchTestReports,
} from '../api/workers';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LogViewer } from '../components/ui/LogViewer';
import { useToast } from '../components/ui/Toast';
import type { WorkerSpec, ActiveWorker, TestReport } from '../types/api';
import {
  Play,
  Square,
  FlaskConical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Activity,
} from 'lucide-react';

export default function WorkerLaunch() {
  const [registry, setRegistry] = useState<Record<string, WorkerSpec>>({});
  const [testReports, setTestReports] = useState<TestReport[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [args, setArgs] = useState<Record<string, string | number | boolean>>(
    {}
  );
  const [testMode, setTestMode] = useState(false);
  const [testSampleSize, setTestSampleSize] = useState(10);
  const [launching, setLaunching] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<string | null>(null);
  const [logLines, setLogLines] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchActive = useCallback(() => fetchActiveWorkers(), []);
  const { data: activeWorkers, refetch: refetchActive } = usePolling(
    fetchActive,
    5_000
  );

  useEffect(() => {
    fetchWorkerRegistry()
      .then((r) => setRegistry(r))
      .catch(() => {});
    fetchTestReports()
      .then((r) => setTestReports(r))
      .catch(() => {});
  }, []);

  const workers = activeWorkers ?? [];

  function handleSelectWorker(type: string) {
    setSelectedWorker(type);
    const spec = registry[type];
    const defaults: Record<string, string | number | boolean> = {};
    if (spec) {
      Object.entries(spec.args_schema).forEach(([key, schema]) => {
        if (schema.default !== undefined) defaults[key] = schema.default;
      });
    }
    setArgs(defaults);
  }

  async function handleLaunch() {
    if (!selectedWorker) return;
    setLaunching(true);
    try {
      await launchWorker({
        worker_type: selectedWorker,
        args,
        test_mode: testMode,
        test_sample_size: testMode ? testSampleSize : undefined,
      });
      toast(
        `${testMode ? 'Test' : 'Worker'} launched: ${selectedWorker.replace(/_/g, ' ')}`,
        'success'
      );
      setSelectedWorker(null);
      refetchActive();
      if (testMode) {
        fetchTestReports()
          .then((r) => setTestReports(r))
          .catch(() => {});
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? String(
              (err as { response?: { data?: { detail?: string } } }).response
                ?.data?.detail
            )
          : 'Launch failed';
      toast(msg, 'error');
    } finally {
      setLaunching(false);
    }
  }

  async function handleStop(workerId: string) {
    if (!window.confirm(`Stop worker ${workerId}?`)) return;
    try {
      await stopWorker(workerId);
      toast('Worker stopped', 'success');
      refetchActive();
    } catch {
      toast('Failed to stop worker', 'error');
    }
  }

  async function handleClear(workerId: string) {
    try {
      await clearWorker(workerId);
      toast('Worker cleared', 'info');
      refetchActive();
    } catch {
      toast('Failed to clear worker', 'error');
    }
  }

  async function toggleLogs(workerId: string) {
    if (expandedLogs === workerId) {
      setExpandedLogs(null);
      return;
    }
    try {
      const data = await fetchWorkerLogs(workerId, 200);
      setLogLines(data.lines);
    } catch {
      setLogLines(['Failed to load logs']);
    }
    setExpandedLogs(workerId);
  }

  return (
    <div className="space-y-6">
      {/* Launch panel */}
      <Card title="Launch Worker" action={<Zap size={16} className="text-accent" />}>
        {/* Worker type selector */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {Object.entries(registry).map(([type, spec]) => (
            <button
              key={type}
              onClick={() => handleSelectWorker(type)}
              className={`rounded-xl border p-3 text-left transition-all ${
                selectedWorker === type
                  ? 'border-accent bg-accent-light shadow-sm'
                  : 'border-surface-700 bg-white hover:border-surface-600 hover:shadow-sm'
              }`}
            >
              <div className="text-sm font-medium text-gray-800">
                {type.replace(/_/g, ' ')}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {spec.description}
              </div>
              <div className="mt-2 flex gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-xs ${
                    spec.category === 'scraper'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-purple-50 text-purple-700'
                  }`}
                >
                  {spec.category}
                </span>
                {!spec.script_exists && (
                  <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs text-red-700">
                    script missing
                  </span>
                )}
              </div>
            </button>
          ))}
          {Object.keys(registry).length === 0 && (
            <div className="col-span-full py-4 text-center text-sm text-gray-400">
              No worker types registered
            </div>
          )}
        </div>

        {/* Config panel */}
        {selectedWorker && registry[selectedWorker] && (
          <div className="space-y-4 rounded-xl border border-surface-700 bg-surface-950 p-4">
            <h4 className="text-sm font-medium text-gray-700">
              Configure: {selectedWorker.replace(/_/g, ' ')}
            </h4>

            {Object.entries(registry[selectedWorker].args_schema).map(
              ([key, schema]) => (
                <div key={key}>
                  <label className="mb-1 block text-xs text-gray-500">
                    {key}
                  </label>
                  {schema.type === 'choice' ? (
                    <select
                      value={String(args[key] ?? schema.default ?? '')}
                      onChange={(e) =>
                        setArgs({ ...args, [key]: e.target.value })
                      }
                      className="w-full rounded-lg border border-surface-700 bg-white px-3 py-1.5 text-sm text-gray-800"
                    >
                      {schema.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={String(args[key] ?? schema.default ?? '')}
                      min={schema.min}
                      max={schema.max}
                      onChange={(e) =>
                        setArgs({
                          ...args,
                          [key]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-32 rounded-lg border border-surface-700 bg-white px-3 py-1.5 font-mono text-sm text-gray-800"
                    />
                  )}
                </div>
              )
            )}

            {/* Test mode toggle */}
            <div className="flex items-center gap-4 border-t border-surface-700 pt-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="accent-accent"
                />
                <FlaskConical size={14} className="text-accent" />
                <span className="text-sm text-gray-700">Test Mode</span>
              </label>
              {testMode && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400">Sample size:</label>
                  <input
                    type="number"
                    value={testSampleSize}
                    onChange={(e) =>
                      setTestSampleSize(parseInt(e.target.value) || 1)
                    }
                    min={1}
                    max={100}
                    className="w-20 rounded-lg border border-surface-700 bg-white px-2 py-1 font-mono text-sm text-gray-800"
                  />
                </div>
              )}
            </div>

            {/* Launch button */}
            <button
              onClick={handleLaunch}
              disabled={launching || !registry[selectedWorker].script_exists}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${
                testMode
                  ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {testMode ? (
                <FlaskConical size={14} />
              ) : (
                <Play size={14} />
              )}
              {launching
                ? 'Launching...'
                : testMode
                  ? 'Run Test'
                  : 'Launch Worker'}
            </button>
          </div>
        )}
      </Card>

      {/* Active workers */}
      <Card
        title="Active Workers"
        action={
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-emerald-600" />
            <span className="font-mono text-xs text-gray-400">
              {workers.length}
            </span>
          </div>
        }
      >
        {workers.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-400">
            No active workers
          </div>
        ) : (
          <div className="space-y-3">
            {workers.map((w: ActiveWorker) => (
              <div
                key={w.worker_id}
                className="overflow-hidden rounded-xl border border-surface-700"
              >
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      status={
                        w.running
                          ? 'running'
                          : w.status === 'stopped'
                            ? 'completed'
                            : 'failed'
                      }
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {w.worker_type.replace(/_/g, ' ')}
                        {w.test_mode && (
                          <span className="ml-2 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">
                            TEST
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        PID {w.pid} · Started{' '}
                        {new Date(w.started_at).toLocaleTimeString()}
                        {w.args &&
                          Object.keys(w.args).length > 0 &&
                          ` · ${JSON.stringify(w.args)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLogs(w.worker_id)}
                      className="p-1 text-gray-400 hover:text-gray-700"
                    >
                      {expandedLogs === w.worker_id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                    {w.running ? (
                      <button
                        onClick={() => handleStop(w.worker_id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Square size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleClear(w.worker_id)}
                        className="p-1 text-gray-400 hover:text-gray-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Log tail preview */}
                {w.log_tail && expandedLogs !== w.worker_id && (
                  <div className="px-3 pb-2">
                    <pre className="truncate font-mono text-xs text-gray-400">
                      {w.log_tail.split('\n').slice(-1)[0]}
                    </pre>
                  </div>
                )}

                {/* Expanded logs */}
                {expandedLogs === w.worker_id && (
                  <div className="border-t border-surface-700">
                    <LogViewer lines={logLines} maxHeight="18rem" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Test reports */}
      {testReports.length > 0 && (
        <Card
          title="Test Reports"
          action={<FlaskConical size={14} className="text-accent" />}
        >
          <div className="space-y-3">
            {testReports.map((r) => (
              <div
                key={r.filename}
                className="rounded-xl border border-surface-700 bg-surface-950 p-3"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="font-mono text-sm text-gray-800">
                    {r.filename}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(r.created).toLocaleString()}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Processed</span>
                    <div className="font-mono text-gray-800">
                      {r.items_processed}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Errors</span>
                    <div
                      className={`font-mono ${r.items_with_errors > 0 ? 'text-red-600' : 'text-emerald-600'}`}
                    >
                      {r.items_with_errors}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Avg Time</span>
                    <div className="font-mono text-gray-800">
                      {r.avg_time_per_item_sec}s
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Est. Full Run</span>
                    <div className="flex items-center gap-1 font-mono text-accent">
                      <Clock size={12} />
                      {r.estimated_total_time_min}m
                    </div>
                  </div>
                </div>
                {r.errors.length > 0 && (
                  <div className="mt-2 font-mono text-xs text-red-600">
                    {r.errors.slice(0, 3).map((e, i) => (
                      <div key={i}>! {e}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
