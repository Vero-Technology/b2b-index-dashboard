import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import { getSECFilings, type SECFiling } from '../../api/data';

export default function SECFilingsPage() {
  const [companyFilter, setCompanyFilter] = useState('');
  const [formType, setFormType] = useState('');
  const [data, setData] = useState<SECFiling[]>([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSECFilings({
        company: companyFilter || undefined,
        form_type: formType || undefined,
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
  }, [companyFilter, formType, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<SECFiling>[] = [
    { key: 'company', header: 'Company' },
    { key: 'form_type', header: 'Form', className: 'w-20' },
    { key: 'filing_date', header: 'Filing Date', className: 'w-28' },
    { 
      key: 'crl_count', 
      header: 'CRLs',
      className: 'w-16 text-center',
      render: (row) => (
        <span className={row.crl_count > 0 ? 'font-medium text-red-600' : 'text-gray-400'}>
          {row.crl_count}
        </span>
      ),
    },
    { 
      key: 'pipeline_count', 
      header: 'Pipeline',
      className: 'w-20 text-center',
      render: (row) => (
        <span className={row.pipeline_count > 0 ? 'font-medium text-blue-600' : 'text-gray-400'}>
          {row.pipeline_count}
        </span>
      ),
    },
    { 
      key: 'patent_count', 
      header: 'Patents',
      className: 'w-20 text-center',
      render: (row) => (
        <span className={row.patent_count > 0 ? 'font-medium text-amber-600' : 'text-gray-400'}>
          {row.patent_count}
        </span>
      ),
    },
    {
      key: 'link',
      header: '',
      render: (row) => row.source_url ? (
        <a 
          href={row.source_url} 
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
        <h1 className="font-display text-lg font-semibold text-gray-800">SEC Filings (10-K/10-Q)</h1>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Company name..."
            value={companyFilter}
            onChange={(e) => { setCompanyFilter(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <select
            value={formType}
            onChange={(e) => { setFormType(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          >
            <option value="">All Forms</option>
            <option value="10-K">10-K</option>
            <option value="10-Q">10-Q</option>
            <option value="8-K">8-K</option>
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
          emptyMessage="No SEC filings found"
        />
      </Card>
    </div>
  );
}
