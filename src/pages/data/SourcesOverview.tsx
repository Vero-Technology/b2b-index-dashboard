import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  FileText,
  Users,
  FlaskConical,
  Pill,
  RefreshCw,
  ArrowRight,
  HardDrive,
  Layers,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { getSourcesStatus } from '../../api/data';
import type { SourceStatus } from '../../types/data';

const SOURCE_ICONS: Record<string, { icon: typeof Database; color: string }> = {
  conference_abstracts: { icon: FileText, color: 'bg-blue-50 text-blue-600' },
  fda_drug_applications: { icon: Pill, color: 'bg-emerald-50 text-emerald-600' },
  ema_epars: { icon: FlaskConical, color: 'bg-purple-50 text-purple-600' },
  fda_adcom_documents: { icon: FileText, color: 'bg-amber-50 text-amber-600' },
  adcom_members: { icon: Users, color: 'bg-rose-50 text-rose-600' },
  fda_drug_documents: { icon: FileText, color: 'bg-cyan-50 text-cyan-600' },
  fda_drug_submissions: { icon: FileText, color: 'bg-gray-50 text-gray-600' },
  press_releases: { icon: FileText, color: 'bg-orange-50 text-orange-600' },
  clinical_trials: { icon: FlaskConical, color: 'bg-teal-50 text-teal-600' },
};

export default function SourcesOverview() {
  const [sources, setSources] = useState<SourceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSources() {
    setLoading(true);
    setError(null);
    try {
      const data = await getSourcesStatus();
      setSources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sources');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSources(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-lg font-semibold text-gray-800">Data Sources</h1>
        <div className="flex items-center gap-2 py-12 text-sm text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Loading sources...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-lg font-semibold text-gray-800">Data Sources</h1>
          <button onClick={fetchSources} className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
        <Card><div className="py-8 text-center text-sm text-red-400">{error}</div></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-semibold text-gray-800">Data Sources</h1>
        <button onClick={fetchSources} className="flex items-center gap-1.5 rounded-lg border border-surface-700 px-3 py-1.5 text-xs text-gray-500 hover:bg-surface-950">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => {
          const meta = SOURCE_ICONS[source.source] || { icon: Database, color: 'bg-gray-50 text-gray-600' };
          const Icon = meta.icon;
          const hasExtraction = source.extraction_type === 'llm';

          return (
            <Link key={source.source} to={`/data/source/${source.source}`} className="group">
              <div className="rounded-xl border border-surface-700 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-accent/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.color}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">{source.label}</h3>
                      <p className="font-mono text-[10px] text-gray-400">{source.table_name}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 transition-colors group-hover:text-accent" />
                </div>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-bold text-gray-900">
                    {source.row_count.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">rows</span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <HardDrive size={10} /> {source.table_size}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers size={10} /> {source.index_count} indexes
                  </span>
                </div>

                {hasExtraction ? (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                      <span>LLM Extraction</span>
                      <span className="font-mono">{source.extraction_progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-800">
                      <div
                        className="h-1.5 rounded-full bg-accent transition-all"
                        style={{ width: `${Math.min(100, source.extraction_progress)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <span className="inline-block rounded-full bg-surface-800 px-2 py-0.5 text-[10px] text-gray-500">
                      No extraction needed
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {sources.length === 0 && (
        <Card>
          <div className="py-8 text-center text-sm text-gray-400">No source data available</div>
        </Card>
      )}
    </div>
  );
}
