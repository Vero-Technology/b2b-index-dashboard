import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import client from '../../api/client';

interface OTInteraction {
  targeta: string;
  targetb: string;
  sourcedatabase: string;
  inta: string;
  intb: string;
  intabiologicalrole: string;
  intbbiologicalrole: string;
  scoring: number;
  count: number;
}

export default function OTInteractionsPage() {
  const [targetFilter, setTargetFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [data, setData] = useState<OTInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: pagination.perPage,
        offset: pagination.offset,
      };
      if (targetFilter) params.target = targetFilter;
      if (sourceFilter) params.source_db = sourceFilter;

      const { data: result } = await client.get('/api/data/ot_interactions', { params });
      setData(result.data || []);
      pagination.setTotal(result.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [targetFilter, sourceFilter, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<OTInteraction>[] = [
    { key: 'targeta', header: 'Target A', className: 'font-mono text-xs' },
    { key: 'targetb', header: 'Target B', className: 'font-mono text-xs' },
    { key: 'sourcedatabase', header: 'Source DB', className: 'w-28' },
    { key: 'inta', header: 'Interactor A', className: 'text-xs' },
    { key: 'intb', header: 'Interactor B', className: 'text-xs' },
    { 
      key: 'scoring', 
      header: 'Score',
      className: 'w-20 text-right',
      render: (row) => (
        <span className="font-mono text-xs">{row.scoring?.toFixed(3) || '—'}</span>
      ),
    },
    { 
      key: 'count', 
      header: 'Count',
      className: 'w-16 text-right',
      render: (row) => (
        <span className="text-xs">{row.count?.toLocaleString() || '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">Open Targets — Protein Interactions</h1>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Target gene (e.g. EGFR)..."
            value={targetFilter}
            onChange={(e) => { setTargetFilter(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <input
            type="text"
            placeholder="Source database..."
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
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
          emptyMessage="No interactions found"
        />
      </Card>
    </div>
  );
}
