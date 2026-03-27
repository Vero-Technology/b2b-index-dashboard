import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import { getFDACRLs } from '../../api/data';

interface FDACRL {
  id: number;
  drug_name: string;
  generic_name: string | null;
  sponsor: string;
  indication: string;
  application_type: string;
  crl_date: string | null;
  rejection_reasons: string[];
  fda_requests: string[];
  source_type: string;
  filing_date: string | null;
  source_url: string;
}

export default function FDACRLsPage() {
  const [drugFilter, setDrugFilter] = useState('');
  const [sponsorFilter, setSponsorFilter] = useState('');
  const [data, setData] = useState<FDACRL[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getFDACRLs({
        drug_name: drugFilter || undefined,
        sponsor: sponsorFilter || undefined,
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
  }, [drugFilter, sponsorFilter, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<FDACRL>[] = [
    { key: 'drug_name', header: 'Drug', mono: true },
    { key: 'sponsor', header: 'Sponsor' },
    { 
      key: 'indication', 
      header: 'Indication',
      render: (row) => (
        <div className="max-w-xs truncate text-gray-500" title={row.indication || ''}>
          {row.indication || '—'}
        </div>
      ),
    },
    { key: 'application_type', header: 'Type', className: 'w-16' },
    { key: 'crl_date', header: 'CRL Date' },
    { key: 'source_type', header: 'Source', className: 'w-16' },
    {
      key: 'expand',
      header: '',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === row.id ? null : row.id); }}
          className="rounded p-1 text-gray-400 hover:bg-surface-800 hover:text-gray-600"
        >
          {expandedId === row.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      ),
      className: 'w-10',
    },
  ];

  const expandedRow = data.find((d) => d.id === expandedId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">FDA Complete Response Letters</h1>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Drug name..."
            value={drugFilter}
            onChange={(e) => { setDrugFilter(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <input
            type="text"
            placeholder="Sponsor..."
            value={sponsorFilter}
            onChange={(e) => { setSponsorFilter(e.target.value); pagination.setPage(1); }}
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
          emptyMessage="No CRLs found"
        />
      </Card>

      {expandedRow && (
        <Card title={`${expandedRow.drug_name} — Details`}>
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-medium text-gray-700 mb-1">Rejection Reasons</div>
              {expandedRow.rejection_reasons?.length ? (
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {expandedRow.rejection_reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              ) : <span className="text-gray-400">—</span>}
            </div>
            <div>
              <div className="font-medium text-gray-700 mb-1">FDA Requests</div>
              {expandedRow.fda_requests?.length ? (
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {expandedRow.fda_requests.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              ) : <span className="text-gray-400">—</span>}
            </div>
            {expandedRow.source_url && (
              <div>
                <a href={expandedRow.source_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  View SEC Filing →
                </a>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
