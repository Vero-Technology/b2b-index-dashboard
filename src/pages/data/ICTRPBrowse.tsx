import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import client from '../../api/client';

const COLUMNS: Column<Record<string, unknown>>[] = [
  { key: 'trial_id', header: 'Trial ID', mono: true },
  { key: 'registry', header: 'Registry' },
  { key: 'public_title', header: 'Title' },
  { key: 'primary_sponsor', header: 'Sponsor' },
  { key: 'phase', header: 'Phase' },
  { key: 'recruitment_status', header: 'Status' },
  { key: 'study_type', header: 'Type' },
  { key: 'target_size', header: 'Size' },
  { key: 'date_registered', header: 'Registered' },
  { key: 'countries', header: 'Countries' },
  { key: 'conditions', header: 'Conditions' },
];

const FILTERS = [
  { key: 'trial_id', label: 'Trial ID' },
  { key: 'registry', label: 'Registry' },
  { key: 'title', label: 'Title' },
  { key: 'sponsor', label: 'Sponsor' },
  { key: 'condition', label: 'Condition' },
  { key: 'intervention', label: 'Intervention' },
  { key: 'country', label: 'Country' },
  { key: 'phase', label: 'Phase' },
  { key: 'status', label: 'Status' },
];

export default function ICTRPBrowse() {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});
  const { page, perPage, setPage } = usePagination();
  const [data, setData] = useState<{ data: Record<string, unknown>[]; total: number }>({ data: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set('limit', String(perPage));
      params.set('offset', String((page - 1) * perPage));
      const res = await client.get(`/api/data/browse_ictrp_trials?${params}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [appliedFilters, page, perPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const applyFilters = () => { setAppliedFilters({ ...filterValues }); setPage(1); };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/data" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="font-display text-lg font-semibold text-gray-800">WHO ICTRP International Trials</h1>
          <p className="text-gray-500">242,833 trials from 15 registries worldwide (excl. US/EU)</p>
        </div>
      </div>

      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            {FILTERS.map(f => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">{f.label}</label>
                <input
                  className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 w-32"
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
