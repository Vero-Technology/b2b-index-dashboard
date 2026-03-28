import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, BarChart3 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import client from '../../api/client';

interface MappingStats {
  gene_mapping: { mapped: number; disgenet_total: number; opentargets_total: number; coverage_pct: number };
  disease_mapping: { mapped: number; disgenet_total: number; opentargets_total: number; coverage_pct: number };
  combined: { total_associations: number; unique_genes: number; unique_diseases: number };
}

function StatsBar({ stats }: { stats: MappingStats | null }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card><div className="p-4 text-center">
        <div className="text-2xl font-bold">{stats.combined.total_associations.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">Cross-Referenced Associations</div>
      </div></Card>
      <Card><div className="p-4 text-center">
        <div className="text-2xl font-bold">{stats.gene_mapping.coverage_pct}%</div>
        <div className="text-sm text-muted-foreground">Gene Coverage ({stats.gene_mapping.mapped.toLocaleString()} / {stats.gene_mapping.disgenet_total.toLocaleString()})</div>
      </div></Card>
      <Card><div className="p-4 text-center">
        <div className="text-2xl font-bold">{stats.disease_mapping.coverage_pct}%</div>
        <div className="text-sm text-muted-foreground">Disease Coverage ({stats.disease_mapping.mapped.toLocaleString()} / {stats.disease_mapping.disgenet_total.toLocaleString()})</div>
      </div></Card>
    </div>
  );
}

const COLUMNS: Column<Record<string, unknown>>[] = [
  { key: 'gene_symbol', header: 'Gene', render: (r) => String(r.gene_symbol || '') },
  { key: 'gene_name', header: 'Gene Name', render: (r) => {
    const name = String(r.gene_name || '');
    return name.length > 40 ? name.slice(0, 40) + '…' : name;
  }},
  { key: 'disease_name', header: 'Disease', render: (r) => {
    const name = String(r.disease_name || '');
    return name.length > 50 ? name.slice(0, 50) + '…' : name;
  }},
  { key: 'dg_score', header: 'DG Score', render: (r) => typeof r.dg_score === 'number' ? r.dg_score.toFixed(3) : '—' },
  { key: 'dg_pmids', header: 'PMIDs', render: (r) => r.dg_pmids != null ? Number(r.dg_pmids).toLocaleString() : '—' },
  { key: 'dg_snps', header: 'SNPs', render: (r) => r.dg_snps != null ? Number(r.dg_snps).toLocaleString() : '—' },
  { key: 'year_final', header: 'Latest', render: (r) => String(r.year_final || '—') },
  { key: 'ensembl_id', header: 'Ensembl', render: (r) => String(r.ensembl_id || '') },
  { key: 'ot_disease_id', header: 'OT Disease ID', render: (r) => String(r.ot_disease_id || '') },
];

export default function CrossRefExplorer() {
  const [mode, setMode] = useState<'browse' | 'gene' | 'disease'>('browse');
  const [searchInput, setSearchInput] = useState('');
  const [geneFilter, setGeneFilter] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [minScore, setMinScore] = useState('');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<MappingStats | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const pagination = usePagination(20);

  useEffect(() => {
    client.get('/api/data/xref/mapping_stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const fetchBrowse = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: String(pagination.perPage), offset: String(pagination.offset) };
      if (geneFilter) params.gene = geneFilter;
      if (diseaseFilter) params.disease = diseaseFilter;
      if (minScore) params.min_score = minScore;
      const res = await client.get('/api/data/xref/gene_disease', { params });
      setData(res.data?.data || []);
      pagination.setTotal(res.data?.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [geneFilter, diseaseFilter, minScore, pagination.perPage, pagination.offset]);

  const fetchGeneSummary = async (gene: string) => {
    setLoading(true);
    try {
      const res = await client.get('/api/data/xref/gene_summary', { params: { gene } });
      setSummary(res.data);
      setMode('gene');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchDiseaseSummary = async (disease: string) => {
    setLoading(true);
    try {
      const res = await client.get('/api/data/xref/disease_summary', { params: { disease } });
      setSummary(res.data);
      setMode('disease');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (mode === 'browse') fetchBrowse(); }, [fetchBrowse, mode]);

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    // Heuristic: if it looks like a gene symbol (all caps, short), search as gene
    if (/^[A-Z][A-Z0-9]{1,10}$/.test(searchInput.trim())) {
      fetchGeneSummary(searchInput.trim());
    } else {
      fetchDiseaseSummary(searchInput.trim());
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="text-muted-foreground hover:text-foreground"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 size={24} /> Cross-Reference Explorer</h1>
          <p className="text-muted-foreground text-sm">1.1M gene-disease associations mapped across DisGeNET ↔ OpenTargets</p>
        </div>
      </div>

      <StatsBar stats={stats} />

      {/* Quick search */}
      <Card>
        <div className="p-4">
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                className="bg-surface-secondary border border-border rounded pl-9 pr-3 py-2 text-sm w-full"
                placeholder="Search gene (e.g. BRCA1) or disease (e.g. breast cancer)"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              />
            </div>
            <button onClick={handleSearch} className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90">Search</button>
            {mode !== 'browse' && (
              <button onClick={() => { setMode('browse'); setSummary(null); }} className="border border-border px-4 py-2 rounded text-sm hover:bg-surface-hover">Back to Browse</button>
            )}
          </div>
        </div>
      </Card>

      {/* Gene Summary View */}
      {mode === 'gene' && summary?.gene && (
        <Card>
          <div className="p-4 space-y-4">
            <div className="flex items-baseline gap-4">
              <h2 className="text-xl font-bold">{summary.gene.gene_symbol}</h2>
              <span className="text-muted-foreground">{summary.gene.gene_name}</span>
              <span className="text-xs bg-surface-secondary px-2 py-1 rounded">Ensembl: {summary.gene.ensembl_id}</span>
              <span className="text-xs bg-surface-secondary px-2 py-1 rounded">NCBI: {summary.gene.ncbi_gene_id}</span>
            </div>
            <p className="text-sm text-muted-foreground">{summary.total} disease associations</p>
            <DataTable
              columns={[
                { key: 'disease_name', header: 'Disease', render: (r: Record<string, unknown>) => String(r.disease_name || '') },
                { key: 'ot_disease_id', header: 'OT ID', render: (r: Record<string, unknown>) => String(r.ot_disease_id || '') },
                { key: 'dg_score', header: 'Score', render: (r: Record<string, unknown>) => typeof r.dg_score === 'number' ? r.dg_score.toFixed(3) : '—' },
                { key: 'dg_pmids', header: 'PMIDs', render: (r: Record<string, unknown>) => r.dg_pmids != null ? Number(r.dg_pmids).toLocaleString() : '—' },
                { key: 'dg_snps', header: 'SNPs', render: (r: Record<string, unknown>) => r.dg_snps != null ? Number(r.dg_snps).toLocaleString() : '—' },
                { key: 'dg_sources', header: 'Sources', render: (r: Record<string, unknown>) => String(r.dg_sources || '').split(';').length + ' sources' },
                { key: 'year_final', header: 'Latest', render: (r: Record<string, unknown>) => String(r.year_final || '—') },
              ]}
              data={summary.diseases || []}
              isLoading={loading}
            />
          </div>
        </Card>
      )}

      {/* Disease Summary View */}
      {mode === 'disease' && summary && (
        <Card>
          <div className="p-4 space-y-4">
            <div className="flex items-baseline gap-4">
              <h2 className="text-xl font-bold">{summary.disease}</h2>
              <span className="text-muted-foreground">{summary.total} associated genes</span>
            </div>
            <DataTable
              columns={[
                { key: 'gene_symbol', header: 'Gene', render: (r: Record<string, unknown>) => String(r.gene_symbol || '') },
                { key: 'gene_name', header: 'Name', render: (r: Record<string, unknown>) => {
                  const n = String(r.gene_name || ''); return n.length > 40 ? n.slice(0,40) + '…' : n;
                }},
                { key: 'ensembl_id', header: 'Ensembl', render: (r: Record<string, unknown>) => String(r.ensembl_id || '') },
                { key: 'dg_score', header: 'Score', render: (r: Record<string, unknown>) => typeof r.dg_score === 'number' ? r.dg_score.toFixed(3) : '—' },
                { key: 'dg_pmids', header: 'PMIDs', render: (r: Record<string, unknown>) => r.dg_pmids != null ? Number(r.dg_pmids).toLocaleString() : '—' },
                { key: 'dg_snps', header: 'SNPs', render: (r: Record<string, unknown>) => r.dg_snps != null ? Number(r.dg_snps).toLocaleString() : '—' },
                { key: 'year_final', header: 'Latest', render: (r: Record<string, unknown>) => String(r.year_final || '—') },
              ]}
              data={summary.genes || []}
              isLoading={loading}
            />
          </div>
        </Card>
      )}

      {/* Browse View */}
      {mode === 'browse' && (
        <Card>
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Gene</label>
                <input className="bg-surface-secondary border border-border rounded px-3 py-1.5 text-sm w-32"
                  placeholder="e.g. TP53" value={geneFilter} onChange={e => setGeneFilter(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { pagination.setPage(1); fetchBrowse(); } }} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Disease</label>
                <input className="bg-surface-secondary border border-border rounded px-3 py-1.5 text-sm w-48"
                  placeholder="e.g. diabetes" value={diseaseFilter} onChange={e => setDiseaseFilter(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { pagination.setPage(1); fetchBrowse(); } }} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Min Score</label>
                <input className="bg-surface-secondary border border-border rounded px-3 py-1.5 text-sm w-20"
                  placeholder="0.3" value={minScore} onChange={e => setMinScore(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { pagination.setPage(1); fetchBrowse(); } }} />
              </div>
              <div className="flex items-end">
                <button onClick={() => { pagination.setPage(1); fetchBrowse(); }}
                  className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm font-medium hover:opacity-90">Filter</button>
              </div>
            </div>

            <DataTable columns={COLUMNS} data={data} isLoading={loading} />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {pagination.offset + 1}–{Math.min(pagination.offset + pagination.perPage, pagination.total)} of {pagination.total.toLocaleString()}
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-border rounded text-sm disabled:opacity-40" disabled={!pagination.hasPrev} onClick={pagination.prevPage}>Prev</button>
                <button className="px-3 py-1 border border-border rounded text-sm disabled:opacity-40" disabled={!pagination.hasNext} onClick={pagination.nextPage}>Next</button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
