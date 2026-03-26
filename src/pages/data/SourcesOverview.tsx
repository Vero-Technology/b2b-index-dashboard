import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  FileText,
  Users,
  FlaskConical,
  Pill,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { getSourcesStatus } from '../../api/data';
import type { SourceStatus } from '../../types/data';

const SOURCE_META: Record<string, { label: string; icon: typeof Database; path: string; color: string }> = {
  conference_abstracts: { label: 'Conference Abstracts', icon: FileText, path: '/data/conference-abstracts', color: 'bg-blue-50 text-blue-600' },
  fda_drug_applications: { label: 'FDA Drug Applications', icon: Pill, path: '/data/fda-applications', color: 'bg-emerald-50 text-emerald-600' },
  ema_epars: { label: 'EMA EPARs', icon: FlaskConical, path: '/data/ema-epars', color: 'bg-purple-50 text-purple-600' },
  fda_adcom_documents: { label: 'AdCom Documents', icon: FileText, path: '/data/adcom-documents', color: 'bg-amber-50 text-amber-600' },
  adcom_members: { label: 'AdCom Members', icon: Users, path: '/data/adcom-members', color: 'bg-rose-50 text-rose-600' },
  fda_drug_documents: { label: 'FDA Drug Documents', icon: FileText, path: '/data/fda-applications', color: 'bg-cyan-50 text-cyan-600' },
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
        <h1 className="font-display text-lg font-semibold text-gray-800">Data Sources</h1>
        <Card>
          <div className="flex flex-col items-center gap-3 py-8 text-sm text-gray-500">
            <AlertCircle size={24} className="text-red-400" />
            <p>{error}</p>
            <button onClick={fetchSources} className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90">
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-lg font-semibold text-gray-800">Data Sources</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => {
          const meta = SOURCE_META[source.source] || SOURCE_META[source.table_name] || {
            label: source.source || source.table_name,
            icon: Database,
            path: '/data',
            color: 'bg-gray-50 text-gray-600',
          };
          const Icon = meta.icon;
          const progress = source.extraction_progress ?? (source.extracted_count && source.row_count
            ? Math.round((source.extracted_count / source.row_count) * 100) : null);

          return (
            <Link key={source.source || source.table_name} to={meta.path} className="group">
              <div className="rounded-xl border border-surface-700 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-accent/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.color}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">{meta.label}</h3>
                      <p className="font-mono text-xs text-gray-400">{source.source || source.table_name}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 transition-colors group-hover:text-accent" />
                </div>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-bold text-gray-900">
                    {(source.row_count ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">rows</span>
                </div>

                {progress !== null && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                      <span>Extraction progress</span>
                      <span className="font-mono">{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-800">
                      <div
                        className="h-1.5 rounded-full bg-accent transition-all"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>
                )}

                {source.last_updated && (
                  <p className="mt-2 text-[10px] text-gray-300">
                    Updated: {new Date(source.last_updated).toLocaleDateString()}
                  </p>
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
