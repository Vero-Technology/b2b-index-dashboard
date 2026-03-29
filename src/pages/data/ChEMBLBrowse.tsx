import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import client from '../../api/client';
import { getSourcesStatus } from '../../api/data';
import type { SourceStatus } from '../../types/data';

const CHEMBL_TABLES = [
  {
    key: 'molecules',
    label: 'Molecules',
    endpoint: 'chembl_molecules',
    columns: ['chembl_id', 'pref_name', 'molecule_type', 'max_phase', 'first_approval', 'therapeutic_flag', 'oral', 'black_box_warning', 'natural_product', 'first_in_class'],
    headers: { chembl_id: 'ChEMBL ID', pref_name: 'Name', molecule_type: 'Type', max_phase: 'Max Phase', first_approval: 'First Approval', therapeutic_flag: 'Therapeutic', oral: 'Oral', black_box_warning: 'Black Box', natural_product: 'Natural', first_in_class: 'First in Class' } as Record<string, string>,
    searchParam: 'search',
    searchPlaceholder: 'Search compound name or ChEMBL ID...',
  },
  {
    key: 'activities',
    label: 'Bioactivities',
    endpoint: 'chembl_activities',
    columns: ['chembl_id', 'compound_name', 'standard_type', 'standard_relation', 'standard_value', 'standard_units', 'pchembl_value'],
    headers: { chembl_id: 'ChEMBL ID', compound_name: 'Compound', standard_type: 'Assay Type', standard_relation: 'Relation', standard_value: 'Value', standard_units: 'Units', pchembl_value: 'pChEMBL' } as Record<string, string>,
    searchParam: 'search',
    searchPlaceholder: 'Search compound name or ChEMBL ID...',
  },
  {
    key: 'targets',
    label: 'Drug Targets',
    endpoint: 'chembl_targets',
    columns: ['chembl_id', 'pref_name', 'target_type', 'organism'],
    headers: { chembl_id: 'ChEMBL ID', pref_name: 'Target Name', target_type: 'Type', organism: 'Organism' } as Record<string, string>,
    searchParam: 'search',
    searchPlaceholder: 'Search target name or organism...',
  },
  {
    key: 'mechanisms',
    label: 'Drug Mechanisms',
    endpoint: 'chembl_mechanisms',
    columns: ['compound_id', 'compound_name', 'mechanism_of_action', 'action_type', 'direct_interaction', 'target_name', 'target_type', 'organism'],
    headers: { compound_id: 'Compound ID', compound_name: 'Compound', mechanism_of_action: 'Mechanism', action_type: 'Action', direct_interaction: 'Direct', target_name: 'Target', target_type: 'Target Type', organism: 'Organism' } as Record<string, string>,
    searchParam: 'search',
    searchPlaceholder: 'Search compound, mechanism, or target...',
  },
  {
    key: 'indications',
    label: 'Drug Indications',
    endpoint: 'chembl_indications',
    columns: ['chembl_id', 'compound_name', 'max_phase', 'mesh_heading', 'max_phase_for_ind'],
    headers: { chembl_id: 'ChEMBL ID', compound_name: 'Compound', max_phase: 'Max Phase', mesh_heading: 'Indication', max_phase_for_ind: 'Phase for Indication' } as Record<string, string>,
    searchParam: 'search',
    searchPlaceholder: 'Search compound or indication...',
  },
];

export default function ChEMBLBrowsePage() {
  const [activeTab, setActiveTab] = useState(CHEMBL_TABLES[0].key);
  const [searchFilter, setSearchFilter] = useState('');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceStatuses, setSourceStatuses] = useState<SourceStatus[]>([]);
  const pagination = usePagination(50);

  const activeTable = CHEMBL_TABLES.find(t => t.key === activeTab)!;
  const sourceKey = `chembl_${activeTab}`;
  const activeSourceStatus = sourceStatuses.find((s) => s.source === sourceKey);

  const columns: Column<Record<string, unknown>>[] = activeTable.columns.map(k => ({
    key: k,
    header: activeTable.headers[k] || k.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    className: 'text-xs',
    render: (row: Record<string, unknown>) => {
      const val = row[k];
      if (val === null || val === undefined) return <span className="text-gray-300">—</span>;
      if (typeof val === 'number') return <span className="font-mono">{val.toLocaleString()}</span>;
      const str = String(val);
      return <span className="line-clamp-2">{str.length > 100 ? str.slice(0, 100) + '…' : str}</span>;
    },
  }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: pagination.perPage,
        offset: pagination.offset,
      };
      if (searchFilter) params[activeTable.searchParam] = searchFilter;
      const { data: result } = await client.get(`/api/data/${activeTable.endpoint}`, { params });
      const rows = result.data || [];
      setData(rows);
      pagination.setTotal(result.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTable, searchFilter, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    getSourcesStatus()
      .then((rows) => setSourceStatuses(Array.isArray(rows) ? rows : []))
      .catch(() => setSourceStatuses([]));
  }, []);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setSearchFilter('');
    setData([]);
    pagination.setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">
          ChEMBL — Drug &amp; Compound Data
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-surface-900 p-1">
        {CHEMBL_TABLES.map(t => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              activeTab === t.key
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeSourceStatus?.embedding_label && typeof activeSourceStatus.embedded_count === 'number' && (
        <Card title="Embedding Status">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{activeSourceStatus.embedding_label}</span>
              <span className="font-mono text-sm font-medium text-gray-800">
                {activeSourceStatus.embedded_count.toLocaleString()} / {activeSourceStatus.row_count.toLocaleString()}
                <span className="ml-2 text-accent">{(activeSourceStatus.embedding_progress || 0).toFixed(1)}%</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-surface-800">
              <div
                className="h-2.5 rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min(100, activeSourceStatus.embedding_progress || 0)}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder={activeTable.searchPlaceholder}
            value={searchFilter}
            onChange={(e) => { setSearchFilter(e.target.value); pagination.setPage(1); }}
            className="flex-1 min-w-[200px] rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
        </div>
      </Card>

      <Card title={`${activeTable.label} Results`} padding={false}>
        <DataTable
          columns={columns}
          data={data}
          isLoading={loading}
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={pagination.setPage}
          emptyMessage={`No ${activeTable.label.toLowerCase()} found`}
        />
      </Card>
    </div>
  );
}
