import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import client from '../../api/client';

const AACT_TABLES = [
  {
    key: 'studies',
    label: 'Studies',
    endpoint: 'browse_ctgov_studies',
    columns: ['nct_id', 'brief_title', 'phase', 'overall_status', 'study_type', 'enrollment', 'lead_sponsor', 'start_date'],
    headers: { nct_id: 'NCT ID', brief_title: 'Title', phase: 'Phase', overall_status: 'Status', study_type: 'Type', enrollment: 'Enrollment', lead_sponsor: 'Sponsor', start_date: 'Start Date' } as Record<string, string>,
    filters: [
      { key: 'nct_id', label: 'NCT ID' },
      { key: 'title', label: 'Title' },
      { key: 'phase', label: 'Phase' },
      { key: 'status', label: 'Status' },
      { key: 'sponsor', label: 'Sponsor' },
      { key: 'condition', label: 'Condition' },
    ],
  },
  {
    key: 'conditions',
    label: 'Conditions',
    endpoint: 'browse_ctgov_conditions',
    columns: ['nct_id', 'name', 'downcase_name'],
    headers: { nct_id: 'NCT ID', name: 'Condition', downcase_name: 'Normalized' } as Record<string, string>,
    filters: [
      { key: 'nct_id', label: 'NCT ID' },
      { key: 'name', label: 'Condition' },
    ],
  },
  {
    key: 'interventions',
    label: 'Interventions',
    endpoint: 'browse_ctgov_interventions',
    columns: ['nct_id', 'intervention_type', 'name', 'description'],
    headers: { nct_id: 'NCT ID', intervention_type: 'Type', name: 'Name', description: 'Description' } as Record<string, string>,
    filters: [
      { key: 'nct_id', label: 'NCT ID' },
      { key: 'name', label: 'Name' },
      { key: 'intervention_type', label: 'Type' },
    ],
  },
  {
    key: 'sponsors',
    label: 'Sponsors',
    endpoint: 'browse_ctgov_sponsors',
    columns: ['nct_id', 'lead_or_collaborator', 'agency_class', 'name'],
    headers: { nct_id: 'NCT ID', lead_or_collaborator: 'Role', agency_class: 'Class', name: 'Name' } as Record<string, string>,
    filters: [
      { key: 'nct_id', label: 'NCT ID' },
      { key: 'name', label: 'Name' },
      { key: 'agency_class', label: 'Class' },
    ],
  },
];

export default function AACTBrowse() {
  const [activeTab, setActiveTab] = useState('studies');
  const table = AACT_TABLES.find(t => t.key === activeTab)!;
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
      const res = await client.get(`/api/data/${table.endpoint}?${params}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [table.endpoint, appliedFilters, page, perPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const applyFilters = () => { setAppliedFilters({ ...filterValues }); setPage(1); };

  const columns: Column<Record<string, unknown>>[] = table.columns.map(col => ({
    key: col,
    header: table.headers[col] || col,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/data" className="text-gray-500 hover:text-gray-900"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="font-display text-lg font-semibold text-gray-800">ClinicalTrials.gov (AACT)</h1>
          <p className="text-gray-500">577,713 studies from the largest clinical trial registry</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {AACT_TABLES.map(t => (
          <button key={t.key}
            onClick={() => { setActiveTab(t.key); setFilterValues({}); setAppliedFilters({}); setPage(1); }}
            className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
              activeTab === t.key ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            {table.filters.map(f => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">{f.label}</label>
                <input
                  className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 w-40"
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
              <span className="text-sm text-gray-500 py-1">Page {page + 1}</span>
              <button disabled={data.data.length < perPage} onClick={() => setPage(page + 1)}
                className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-800 disabled:opacity-40">Next</button>
            </div>
          </div>
          <DataTable columns={columns} data={data.data} isLoading={loading} />
        </div>
      </Card>
    </div>
  );
}
