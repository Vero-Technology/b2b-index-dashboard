import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import client from '../../api/client';

const ASSOC_TABLES = [
  { key: 'ot_association_overall_direct', label: 'Overall Direct', count: '4.5M' },
  { key: 'ot_association_overall_indirect', label: 'Overall Indirect', count: '12.5M' },
  { key: 'ot_association_by_datasource_direct', label: 'By Datasource Direct', count: '4.7M' },
  { key: 'ot_association_by_datasource_indirect', label: 'By Datasource Indirect', count: '14.9M' },
  { key: 'ot_association_by_datatype_direct', label: 'By Datatype Direct', count: '4.7M' },
  { key: 'ot_association_by_datatype_indirect', label: 'By Datatype Indirect', count: '14.6M' },
];

const COLUMNS: Column<Record<string, unknown>>[] = [
  { key: 'target_name', header: 'Target' },
  { key: 'disease_name', header: 'Disease' },
  { key: 'aggregationtype', header: 'Aggregation' },
  { key: 'score', header: 'Score' },
  { key: 'evidencecount', header: 'Evidence Count' },
  { key: 'currentnovelty', header: 'Novelty' },
  { key: 'targetid', header: 'Target ID', mono: true },
  { key: 'diseaseid', header: 'Disease ID', mono: true },
];

export default function OTAssociationBrowse() {
  const [activeTab, setActiveTab] = useState(ASSOC_TABLES[0].key);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});
  const { page, perPage, setPage } = usePagination();
  const [data, setData] = useState<{ data: Record<string, unknown>[]; total: number }>({ data: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('table', activeTab);
      Object.entries(appliedFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set('limit', String(perPage));
      params.set('offset', String((page - 1) * perPage));
      const res = await client.get(`/api/data/browse_ot_association?${params}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [activeTab, appliedFilters, page, perPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const applyFilters = () => { setAppliedFilters({ ...filterValues }); setPage(1); };

  const filters = [
    { key: 'target_name', label: 'Target Gene' },
    { key: 'disease_name', label: 'Disease' },
    { key: 'targetid', label: 'Target ID' },
    { key: 'diseaseid', label: 'Disease ID' },
    { key: 'aggregationtype', label: 'Aggregation Type' },
    { key: 'min_score', label: 'Min Score' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/data" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="font-display text-lg font-semibold text-gray-800">OpenTargets Associations</h1>
          <p className="text-gray-500">55.9M gene-disease associations across 6 tables</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {ASSOC_TABLES.map(t => (
          <button key={t.key}
            onClick={() => { setActiveTab(t.key); setFilterValues({}); setAppliedFilters({}); setPage(1); }}
            className={`px-3 py-1.5 rounded-t text-xs font-medium transition-colors ${
              activeTab === t.key ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}>
            {t.label} <span className="text-gray-400 ml-1">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            {filters.map(f => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">{f.label}</label>
                <input
                  className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 w-36"
                  placeholder={f.label + '...'}
                  value={filterValues[f.key] || ''}
                  onChange={e => setFilterValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && applyFilters()}
                />
              </div>
            ))}
            <button onClick={applyFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm">
              Search
            </button>
          </div>
        </div>
      </Card>

      {/* Results */}
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{data.total.toLocaleString()} results</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}
                className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-800 disabled:opacity-40">Prev</button>
              <span className="text-sm text-gray-500 py-1">Page {page}</span>
              <button disabled={data.data.length < perPage} onClick={() => setPage(page + 1)}
                className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-800 disabled:opacity-40">Next</button>
            </div>
          </div>
          <DataTable columns={COLUMNS} data={data.data} isLoading={loading} />
        </div>
      </Card>
    </div>
  );
}
