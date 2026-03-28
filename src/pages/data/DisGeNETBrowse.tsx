import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import client from '../../api/client';

const DISGENET_TABLES = [
  {
    key: 'gda',
    label: 'Gene-Disease Associations (1.1M)',
    endpoint: 'disgenet_gda',
    columns: ['gene_symbol', 'disease_name', 'disease_type', 'score', 'ei', 'year_initial', 'year_final', 'n_pmids', 'n_snps', 'source'],
    headers: { gene_symbol: 'Gene', disease_name: 'Disease', disease_type: 'Type', score: 'Score', ei: 'EI', year_initial: 'Year Start', year_final: 'Year End', n_pmids: 'PMIDs', n_snps: 'SNPs', source: 'Source' } as Record<string, string>,
    filters: [
      { key: 'gene', label: 'Gene', type: 'text' as const },
      { key: 'disease', label: 'Disease', type: 'text' as const },
      { key: 'min_score', label: 'Min Score', type: 'text' as const },
    ],
  },
  {
    key: 'mappings',
    label: 'Disease Mappings (243K)',
    endpoint: 'disgenet_disease_mappings',
    columns: ['disease_id', 'name', 'vocabulary', 'code', 'vocabulary_name'],
    headers: { disease_id: 'Disease ID', name: 'Name', vocabulary: 'Vocabulary', code: 'Code', vocabulary_name: 'Vocabulary Name' } as Record<string, string>,
    filters: [
      { key: 'disease', label: 'Disease Name', type: 'text' as const },
      { key: 'vocabulary', label: 'Vocabulary', type: 'select' as const, options: ['DO', 'EFO', 'HPO', 'ICD10CM', 'ICD9CM', 'MESH', 'MSH', 'NCI', 'OMIM', 'ORDO'] },
    ],
  },
];

export default function DisGeNETBrowsePage() {
  const [activeTab, setActiveTab] = useState(DISGENET_TABLES[0].key);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(50);

  const activeTable = DISGENET_TABLES.find(t => t.key === activeTab)!;

  const columns: Column<Record<string, unknown>>[] = activeTable.columns.map(k => ({
    key: k,
    header: activeTable.headers[k] || k,
    render: (row: Record<string, unknown>) => {
      const val = row[k];
      if (val === null || val === undefined) return '—';
      if (k === 'score' || k === 'ei') return typeof val === 'number' ? val.toFixed(3) : String(val);
      if (k === 'source') return String(val).replace(/;/g, ', ');
      return String(val);
    },
  }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        limit: String(pagination.perPage),
        offset: String(pagination.offset),
      };
      Object.entries(filterValues).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await client.get(`/api/data/${activeTable.endpoint}`, { params });
      setData(res.data?.data || []);
      pagination.setTotal(res.data?.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterValues, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setFilterValues({});
    pagination.setPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="text-muted-foreground hover:text-foreground"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold">DisGeNET</h1>
          <p className="text-muted-foreground text-sm">1.1M gene-disease associations from curated + text-mined sources (v7)</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {DISGENET_TABLES.map(t => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-3 mb-4">
            {activeTable.filters.map(f => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    className="bg-surface-secondary border border-border rounded px-3 py-1.5 text-sm"
                    value={filterValues[f.key] || ''}
                    onChange={e => { setFilterValues(prev => ({ ...prev, [f.key]: e.target.value })); pagination.setPage(1); }}
                  >
                    <option value="">All</option>
                    {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    className="bg-surface-secondary border border-border rounded px-3 py-1.5 text-sm w-40"
                    placeholder={f.label}
                    value={filterValues[f.key] || ''}
                    onChange={e => setFilterValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { pagination.setPage(1); fetchData(); } }}
                  />
                )}
              </div>
            ))}
            <div className="flex items-end">
              <button
                onClick={() => { pagination.setPage(1); fetchData(); }}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm font-medium hover:opacity-90"
              >
                Search
              </button>
            </div>
          </div>

          <DataTable columns={columns} data={data} isLoading={loading} />

          <div className="flex items-center justify-between mt-4">
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
    </div>
  );
}
