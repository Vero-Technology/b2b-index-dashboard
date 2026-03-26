import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import { getEmaEpars } from '../../api/data';
import type { EmaEpar } from '../../types/api';

export default function EMAEparsPage() {
  const [therapeuticArea, setTherapeuticArea] = useState('');
  const [data, setData] = useState<EmaEpar[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getEmaEpars({
        therapeutic_area: therapeuticArea || undefined,
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
  }, [therapeuticArea, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<EmaEpar>[] = [
    { key: 'product_name', header: 'Product', mono: true },
    { key: 'active_substance', header: 'Active Substance' },
    { key: 'therapeutic_area', header: 'Therapeutic Area' },
    {
      key: 'indication',
      header: 'Indication',
      render: (row) => (
        <div className="max-w-xs truncate text-gray-500" title={row.indication || ''}>{row.indication || '—'}</div>
      ),
    },
    { key: 'marketing_auth_holder', header: 'MAH' },
    {
      key: 'expand',
      header: '',
      render: (row) => {
        const hasDetail = row.benefit_risk_summary || (row as unknown as Record<string, unknown>).clinical_efficacy || (row as unknown as Record<string, unknown>).clinical_safety;
        return hasDetail ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === row.id ? null : row.id); }}
            className="rounded p-1 text-gray-400 hover:bg-surface-800 hover:text-gray-600"
          >
            {expandedId === row.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        ) : null;
      },
      className: 'w-10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">EMA EPARs</h1>
      </div>

      <Card title="Filters">
        <input
          type="text"
          placeholder="Therapeutic area..."
          value={therapeuticArea}
          onChange={(e) => { setTherapeuticArea(e.target.value); pagination.setPage(1); }}
          className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
        />
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
          emptyMessage="No EMA EPARs found"
        />
        {expandedId && data.find((d) => d.id === expandedId) && (
          <ExpandedEpar epar={data.find((d) => d.id === expandedId)!} />
        )}
      </Card>
    </div>
  );
}

function ExpandedEpar({ epar }: { epar: EmaEpar }) {
  const ext = epar as unknown as Record<string, unknown>;
  return (
    <div className="border-t border-surface-700 bg-surface-950 px-6 py-4 space-y-3">
      {epar.benefit_risk_summary && (
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-1">Benefit-Risk Summary</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{epar.benefit_risk_summary}</p>
        </div>
      )}
      {ext.clinical_efficacy ? (
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-1">Clinical Efficacy</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{String(ext.clinical_efficacy)}</p>
        </div>
      ) : null}
      {ext.clinical_safety ? (
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-1">Clinical Safety</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{String(ext.clinical_safety)}</p>
        </div>
      ) : null}
    </div>
  );
}
