import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import { getEMARefusals } from '../../api/data';

interface EMARefusal {
  id: number;
  product_name: string;
  active_substance: string | null;
  therapeutic_area: string | null;
  outcome_type: string;
  reason: string | null;
  decision_date: string | null;
  epar_url: string | null;
}

export default function EMARefusalsPage() {
  const [productFilter, setProductFilter] = useState('');
  const [outcomeType, setOutcomeType] = useState('');
  const [data, setData] = useState<EMARefusal[]>([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getEMARefusals({
        product_name: productFilter || undefined,
        outcome_type: outcomeType || undefined,
        limit: pagination.perPage,
        offset: pagination.offset,
      });
      setData(result.data);
      pagination.setTotal(result.total);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [productFilter, outcomeType, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<EMARefusal>[] = [
    { key: 'product_name', header: 'Product', mono: true },
    { key: 'active_substance', header: 'Active Substance' },
    { key: 'therapeutic_area', header: 'Therapeutic Area' },
    { 
      key: 'outcome_type', 
      header: 'Outcome',
      render: (row) => (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
          row.outcome_type?.toLowerCase().includes('refused') 
            ? 'bg-red-50 text-red-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {row.outcome_type || '—'}
        </span>
      ),
    },
    { key: 'decision_date', header: 'Decision Date', className: 'w-28' },
    {
      key: 'link',
      header: '',
      render: (row) => row.epar_url ? (
        <a 
          href={row.epar_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-accent"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={14} />
        </a>
      ) : null,
      className: 'w-10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">EMA Refusals & Withdrawals</h1>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Product name..."
            value={productFilter}
            onChange={(e) => { setProductFilter(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <select
            value={outcomeType}
            onChange={(e) => { setOutcomeType(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          >
            <option value="">All Outcomes</option>
            <option value="refused">Refused</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
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
          emptyMessage="No EMA refusals found"
        />
      </Card>
    </div>
  );
}
