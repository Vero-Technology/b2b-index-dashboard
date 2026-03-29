import { useState, useEffect, useMemo } from 'react';
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
  Search,
  ChevronDown,
  ChevronRight,
  Beaker,
  Scale,
  Dna,
  FlaskRound,
  BookOpen,
  Shield,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { getSourcesStatus } from '../../api/data';
import type { SourceStatus } from '../../types/data';

// ── Category mapping: source key → category ──────────────────────────
const SOURCE_CATEGORY: Record<string, string> = {
  // Clinical Trials
  ctgov_studies: 'Clinical Trials',
  ctgov_conditions: 'Clinical Trials',
  ctgov_interventions: 'Clinical Trials',
  ctgov_sponsors: 'Clinical Trials',
  eu_clinical_trials: 'Clinical Trials',
  ictrp_trials: 'Clinical Trials',
  // Regulatory Intelligence
  fda_drug_applications: 'Regulatory Intelligence',
  adcom_members: 'Regulatory Intelligence',
  fda_adcom_documents: 'Regulatory Intelligence',
  fda_drug_documents: 'Regulatory Intelligence',
  ema_epars: 'Regulatory Intelligence',
  sec_filing_extractions: 'Regulatory Intelligence',
  fda_complete_response_letters: 'Regulatory Intelligence',
  ema_negative_outcomes: 'Regulatory Intelligence',
  fda_purple_book: 'Regulatory Intelligence',
  fda_purple_book_patents: 'Regulatory Intelligence',
  fda_orange_book_patents: 'Regulatory Intelligence',
  fda_orange_book_products: 'Regulatory Intelligence',
  fda_orange_book_exclusivity: 'Regulatory Intelligence',
  // Biomarker & Targets
  disgenet_gda: 'Biomarker & Targets',
  disgenet_disease_mappings: 'Biomarker & Targets',
  pharmgkb_relationships: 'Biomarker & Targets',
  pharmgkb_clinical_annotations: 'Biomarker & Targets',
  pharmgkb_genes: 'Biomarker & Targets',
  pharmgkb_drugs: 'Biomarker & Targets',
  pharmgkb_drug_labels: 'Biomarker & Targets',
  pharmgkb_variants: 'Biomarker & Targets',
  // Genetic & Genomic Intelligence
  ot_interaction: 'Genetic & Genomic Intelligence',
  ot_study: 'Genetic & Genomic Intelligence',
  ot_literature: 'Genetic & Genomic Intelligence',
  ot_colocalisation: 'Genetic & Genomic Intelligence',
  ot_disease_phenotype: 'Genetic & Genomic Intelligence',
  ot_mouse_phenotype: 'Genetic & Genomic Intelligence',
  ot_pharmacogenomics: 'Genetic & Genomic Intelligence',
  ot_target_prioritisation: 'Genetic & Genomic Intelligence',
  ot_association_overall_direct: 'Genetic & Genomic Intelligence',
  ot_association_overall_indirect: 'Genetic & Genomic Intelligence',
  ot_association_by_datasource_direct: 'Genetic & Genomic Intelligence',
  ot_association_by_datasource_indirect: 'Genetic & Genomic Intelligence',
  ot_association_by_datatype_direct: 'Genetic & Genomic Intelligence',
  ot_association_by_datatype_indirect: 'Genetic & Genomic Intelligence',
  // Drug & Compound Intelligence
  chembl_activities: 'Drug & Compound Intelligence',
  chembl_molecules: 'Drug & Compound Intelligence',
  chembl_assays: 'Drug & Compound Intelligence',
  chembl_targets: 'Drug & Compound Intelligence',
  chembl_mechanisms: 'Drug & Compound Intelligence',
  chembl_indications: 'Drug & Compound Intelligence',
  // Patent Intelligence
  uspto_pharma_patents: 'Patent Intelligence',
  // Conference Abstracts
  conference_abstracts: 'Conference Abstracts',
};

const CATEGORY_ORDER = [
  'Clinical Trials',
  'Regulatory Intelligence',
  'Drug & Compound Intelligence',
  'Genetic & Genomic Intelligence',
  'Biomarker & Targets',
  'Patent Intelligence',
  'Conference Abstracts',
];

const CATEGORY_ICONS: Record<string, typeof Database> = {
  'Clinical Trials': Beaker,
  'Regulatory Intelligence': Scale,
  'Drug & Compound Intelligence': Pill,
  'Genetic & Genomic Intelligence': Dna,
  'Biomarker & Targets': FlaskRound,
  'Patent Intelligence': Shield,
  'Conference Abstracts': BookOpen,
};

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
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

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

  const filtered = useMemo(() => {
    if (!search.trim()) return sources;
    const q = search.toLowerCase();
    return sources.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.source.toLowerCase().includes(q) ||
        s.table_name.toLowerCase().includes(q) ||
        (SOURCE_CATEGORY[s.source] || '').toLowerCase().includes(q)
    );
  }, [sources, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, SourceStatus[]> = {};
    for (const s of filtered) {
      const cat = SOURCE_CATEGORY[s.source] || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    }
    // Sort by CATEGORY_ORDER
    const ordered: { category: string; sources: SourceStatus[] }[] = [];
    for (const cat of CATEGORY_ORDER) {
      if (groups[cat]) {
        ordered.push({ category: cat, sources: groups[cat] });
        delete groups[cat];
      }
    }
    // Any remaining (uncategorized)
    for (const [cat, srcs] of Object.entries(groups)) {
      ordered.push({ category: cat, sources: srcs });
    }
    return ordered;
  }, [filtered]);

  const totalRows = useMemo(
    () => sources.reduce((sum, s) => sum + (s.row_count || 0), 0),
    [sources]
  );

  const toggleCategory = (cat: string) =>
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-semibold text-gray-800">Data Sources</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {sources.length} sources · {totalRows.toLocaleString()} total rows
          </p>
        </div>
        <button onClick={fetchSources} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="text"
          placeholder="Search sources (e.g. AACT, ChEMBL, FDA, patents...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/20"
        />
      </div>

      {/* Grouped categories */}
      {grouped.map(({ category, sources: catSources }) => {
        const isCollapsed = collapsed[category];
        const CatIcon = CATEGORY_ICONS[category] || Database;
        const catRows = catSources.reduce((s, src) => s + (src.row_count || 0), 0);

        return (
          <div key={category} className="space-y-3">
            {/* Category header */}
            <button
              onClick={() => toggleCategory(category)}
              className="flex w-full items-center justify-between rounded-lg px-1 py-1 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {isCollapsed ? (
                  <ChevronRight size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
                <CatIcon size={16} className="text-accent" />
                <span className="text-sm font-semibold text-gray-800">{category}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  {catSources.length}
                </span>
              </div>
              <span className="font-mono text-xs text-gray-400">
                {catRows.toLocaleString()} rows
              </span>
            </button>

            {/* Source cards */}
            {!isCollapsed && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {catSources.map((source) => (
                  <SourceCard key={source.source} source={source} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <Card>
          <div className="py-8 text-center text-sm text-gray-400">
            {search ? `No sources matching "${search}"` : 'No source data available'}
          </div>
        </Card>
      )}
    </div>
  );
}

function SourceCard({ source }: { source: SourceStatus }) {
  const meta = SOURCE_ICONS[source.source] || { icon: Database, color: 'bg-gray-50 text-gray-600' };
  const Icon = meta.icon;
  const hasExtraction = source.extraction_type === 'llm';

  return (
    <Link to={`/data/source/${source.source}`} className="group">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-accent/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.color}`}>
              <Icon size={14} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800">{source.label}</h3>
              <p className="font-mono text-[10px] text-gray-400">{source.table_name}</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-gray-300 transition-colors group-hover:text-accent" />
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-mono text-xl font-bold text-gray-900">
            {source.row_count.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">rows</span>
        </div>

        <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <HardDrive size={10} /> {source.table_size}
          </span>
          <span className="flex items-center gap-1">
            <Layers size={10} /> {source.index_count} idx
          </span>
        </div>

        {hasExtraction ? (
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
              <span>LLM Extraction</span>
              <span className="font-mono">{source.extraction_progress.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100">
              <div
                className="h-1.5 rounded-full bg-accent transition-all"
                style={{ width: `${Math.min(100, source.extraction_progress)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
              No extraction needed
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
