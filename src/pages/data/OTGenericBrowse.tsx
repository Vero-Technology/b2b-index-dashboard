import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import client from '../../api/client';

const OT_TABLE_META: Record<string, { label: string; endpoint: string }> = {
  'ot-interactions': { label: 'Protein Interactions', endpoint: 'ot_interactions' },
  'ot-studies': { label: 'GWAS Studies', endpoint: 'ot_studies' },
  'ot-literature': { label: 'Literature', endpoint: 'ot_literature' },
  'ot-colocalisation': { label: 'Colocalisation', endpoint: 'ot_colocalisation' },
  'ot-disease-phenotype': { label: 'Disease Phenotypes', endpoint: 'ot_disease_phenotype' },
  'ot-mouse-phenotype': { label: 'Mouse Phenotypes', endpoint: 'ot_mouse_phenotype' },
  'ot-pharmacogenomics': { label: 'Pharmacogenomics', endpoint: 'ot_pharmacogenomics' },
  'ot-target-prioritisation': { label: 'Target Prioritisation', endpoint: 'ot_target_prioritisation' },
};

export default function OTGenericBrowsePage() {
  const location = useLocation();
  const table = location.pathname.split('/data/')[1];
  const meta = table ? OT_TABLE_META[table] : null;
  const [searchFilter, setSearchFilter] = useState('');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<Column<Record<string, unknown>>[]>([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    if (!meta) return;
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: pagination.perPage,
        offset: pagination.offset,
      };
      if (searchFilter) params.search = searchFilter;

      const { data: result } = await client.get(`/api/data/${meta.endpoint}`, { params });
      const rows = result.data || [];
      setData(rows);
      pagination.setTotal(result.total || 0);

      // Auto-generate columns from first row
      if (rows.length > 0 && columns.length === 0) {
        const keys = Object.keys(rows[0]).filter(k => 
          k !== 'id' && typeof rows[0][k] !== 'object'
        ).slice(0, 8);
        setColumns(keys.map(k => ({
          key: k,
          header: k.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          className: 'text-xs',
          render: (row: Record<string, unknown>) => {
            const val = row[k];
            if (val === null || val === undefined) return <span className="text-gray-300">—</span>;
            if (typeof val === 'number') return <span className="font-mono">{val.toLocaleString()}</span>;
            const str = String(val);
            return <span className="line-clamp-2">{str.length > 100 ? str.slice(0, 100) + '…' : str}</span>;
          },
        })));
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [meta, searchFilter, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!meta) {
    return <div className="py-8 text-center text-gray-400">Unknown OT table</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">
          Open Targets — {meta.label}
        </h1>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchFilter}
            onChange={(e) => { setSearchFilter(e.target.value); pagination.setPage(1); }}
            className="flex-1 min-w-[200px] rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
        </div>
      </Card>

      <Card title="Results" padding={false}>
        <DataTable
          columns={columns}
          data={data}
          isLoading={loading}
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={pagination.setPage}
          emptyMessage="No data found"
        />
      </Card>
    </div>
  );
}
