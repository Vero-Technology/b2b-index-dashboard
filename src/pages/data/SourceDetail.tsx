import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Database,
  HardDrive,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { getSourcesStatus, getSourceQuality } from '../../api/data';
import type { SourceStatus, SourceQuality } from '../../types/data';

const BROWSE_ROUTES: Record<string, string> = {
  conference_abstracts: '/data/conference-abstracts',
  fda_drug_applications: '/data/fda-applications',
  ema_epars: '/data/ema-epars',
  fda_adcom_documents: '/data/adcom-documents',
  adcom_members: '/data/adcom-members',
  fda_drug_documents: '/data/fda-documents',
  clinical_trials: '/data/clinical-trials',
  sec_filing_extractions: '/data/sec-filings',
  fda_complete_response_letters: '/data/fda-crls',
  ema_negative_outcomes: '/data/ema-refusals',
  eu_clinical_trials: '/data/eu-clinical-trials',
  ot_interaction: '/data/ot-interactions',
  ot_study: '/data/ot-studies',
  ot_literature: '/data/ot-literature',
  ot_colocalisation: '/data/ot-colocalisation',
  ot_disease_phenotype: '/data/ot-disease-phenotype',
  ot_mouse_phenotype: '/data/ot-mouse-phenotype',
  ot_pharmacogenomics: '/data/ot-pharmacogenomics',
  ot_target_prioritisation: '/data/ot-target-prioritisation',
  chembl_activities: '/data/chembl',
  chembl_molecules: '/data/chembl',
  chembl_assays: '/data/chembl',
  chembl_targets: '/data/chembl',
  chembl_mechanisms: '/data/chembl',
  chembl_indications: '/data/chembl',
  uspto_pharma_patents: '/data/uspto-patents',
  disgenet_gda: '/data/disgenet',
  disgenet_disease_mappings: '/data/disgenet',
  pharmgkb_relationships: '/data/pharmgkb',
  pharmgkb_clinical_annotations: '/data/pharmgkb',
  pharmgkb_genes: '/data/pharmgkb',
  pharmgkb_drugs: '/data/pharmgkb',
  pharmgkb_drug_labels: '/data/pharmgkb',
  pharmgkb_variants: '/data/pharmgkb',
  ctgov_studies: '/data/aact',
  ctgov_conditions: '/data/aact',
  ctgov_interventions: '/data/aact',
  ctgov_sponsors: '/data/aact',
};

export default function SourceDetail() {
  const { source: sourceKey } = useParams<{ source: string }>();
  const [status, setStatus] = useState<SourceStatus | null>(null);
  const [quality, setQuality] = useState<SourceQuality | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);

  async function fetchData() {
    if (!sourceKey) return;
    setLoading(true);
    setError(null);
    try {
      const [allSources, qual] = await Promise.all([
        getSourcesStatus(),
        getSourceQuality(sourceKey).catch(() => null),
      ]);
      const found = allSources.find((s) => s.source === sourceKey);
      if (!found) throw new Error(`Source "${sourceKey}" not found`);
      setStatus(found);
      setQuality(qual);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, [sourceKey]);

  if (loading) {
    return (
      <div className="space-y-6">
        <BackLink />
        <div className="flex items-center gap-2 py-12 text-sm text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Loading source details...
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="space-y-6">
        <BackLink />
        <Card>
          <div className="flex flex-col items-center gap-3 py-8 text-sm text-gray-500">
            <AlertCircle size={24} className="text-red-400" />
            <p>{error || 'Source not found'}</p>
            <button onClick={fetchData} className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90">
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const fieldQuality = quality?.field_quality || status.field_quality || {};
  const samples = quality?.sample_records || [];
  const browsePath = BROWSE_ROUTES[status.source];

  return (
    <div className="space-y-6">
      <BackLink />

      {/* Header */}
      <div className="rounded-xl border border-surface-700 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{status.label}</h1>
            <p className="font-mono text-xs text-gray-400 mt-0.5">{status.table_name}</p>
          </div>
          {browsePath && (
            <Link to={browsePath} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90">
              <ExternalLink size={14} /> Browse Data
            </Link>
          )}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatBox icon={<Database size={14} />} label="Rows" value={status.row_count.toLocaleString()} />
          <StatBox icon={<HardDrive size={14} />} label="Table Size" value={status.table_size} />
          <StatBox icon={<HardDrive size={14} />} label="Data Size" value={status.data_size} />
          <StatBox icon={<Layers size={14} />} label="Indexes" value={String(status.index_count)} />
        </div>
      </div>

      {/* Extraction Status */}
      <Card title="Extraction Status">
        {status.extraction_type === 'llm' ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">LLM Extraction</span>
              <span className="font-mono text-sm font-medium text-gray-800">
                {status.extracted_count.toLocaleString()} / {status.row_count.toLocaleString()}
                <span className="ml-2 text-accent">{status.extraction_progress.toFixed(1)}%</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-surface-800">
              <div
                className="h-2.5 rounded-full bg-accent transition-all"
                style={{ width: `${Math.min(100, status.extraction_progress)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-surface-800 px-3 py-1 text-sm text-gray-500">
              No extraction needed
            </span>
            <span className="text-xs text-gray-400">This source uses structured data ingestion</span>
          </div>
        )}
      </Card>

      {/* Field Quality */}
      {Object.keys(fieldQuality).length > 0 && (
        <Card title="Field Quality">
          <div className="space-y-2">
            {Object.entries(fieldQuality)
              .sort(([, a], [, b]) => b.rate - a.rate)
              .map(([field, info]) => {
                const color = info.rate >= 80 ? 'bg-emerald-500' : info.rate >= 50 ? 'bg-amber-400' : 'bg-red-400';
                return (
                  <div key={field} className="flex items-center gap-3">
                    <span className="w-44 shrink-0 truncate font-mono text-xs text-gray-600" title={field}>{field}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-800">
                      <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${info.rate}%` }} />
                    </div>
                    <span className="w-20 text-right font-mono text-xs text-gray-500">
                      {info.rate.toFixed(1)}% <span className="text-gray-300">({info.populated.toLocaleString()})</span>
                    </span>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Indexes */}
      {status.indexes && status.indexes.length > 0 && (
        <Card title={`Indexes (${status.indexes.length})`} padding={false}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-gray-400">Index Name</th>
                <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-gray-400 text-right">Size</th>
              </tr>
            </thead>
            <tbody>
              {status.indexes.map((idx) => (
                <tr key={idx.indexname} className="border-b border-surface-800/50">
                  <td className="px-5 py-2.5 font-mono text-xs text-gray-700">{idx.indexname}</td>
                  <td className="px-5 py-2.5 font-mono text-xs text-gray-500 text-right">{idx.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Sample Records */}
      {samples.length > 0 && (
        <Card title={`Sample Records (${samples.length})`}>
          <div className="space-y-2">
            {samples.map((record, i) => (
              <div key={i} className="rounded-lg border border-surface-700">
                <button
                  onClick={() => setExpandedRecord(expandedRecord === i ? null : i)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-surface-950 transition-colors"
                >
                  <span className="text-sm text-gray-700">
                    {'Record #'}{i + 1}
                    {'id' in record && record.id != null && <span className="ml-2 font-mono text-xs text-gray-400">{'ID: '}{String(record.id)}</span>}
                    {'title' in record && record.title != null && <span className="ml-2 text-xs text-gray-500 truncate max-w-md inline-block align-bottom">{String(record.title)}</span>}
                    {'product_name' in record && record.product_name != null && <span className="ml-2 text-xs text-gray-500">{String(record.product_name)}</span>}
                    {'application_number' in record && record.application_number != null && <span className="ml-2 font-mono text-xs text-gray-500">{String(record.application_number)}</span>}
                  </span>
                  {expandedRecord === i ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </button>
                {expandedRecord === i && (
                  <div className="border-t border-surface-700 bg-surface-950 px-4 py-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {Object.entries(record).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-[10px] font-medium uppercase text-gray-400">{key}</span>
                          <p className="text-sm text-gray-700 break-all">
                            {value === null ? <span className="text-gray-300 italic">null</span> :
                              typeof value === 'object' ? (
                                <pre className="text-xs bg-surface-900 rounded p-2 mt-0.5 overflow-auto max-h-40">{JSON.stringify(value, null, 2)}</pre>
                              ) : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
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

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-950 px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
        {icon} {label}
      </div>
      <div className="font-mono text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}

function BackLink() {
  return (
    <div className="flex items-center gap-3">
      <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
        <ArrowLeft size={16} />
      </Link>
      <h1 className="font-display text-lg font-semibold text-gray-800">Source Detail</h1>
    </div>
  );
}
