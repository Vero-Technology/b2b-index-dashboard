import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import type { Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import { getFDADrugApplications } from '../../api/data';
import type { FDADrugApplication } from '../../types/data';

const PRODUCT_TYPES = ['', 'NDA', 'BLA', 'ANDA'];

const DESIGNATION_BADGES: Record<string, { label: string; color: string }> = {
  fast_track: { label: 'FT', color: 'bg-blue-50 text-blue-700' },
  breakthrough_therapy: { label: 'BT', color: 'bg-emerald-50 text-emerald-700' },
  accelerated_approval: { label: 'AA', color: 'bg-amber-50 text-amber-700' },
  orphan_drug: { label: 'OD', color: 'bg-purple-50 text-purple-700' },
};

export default function FDAApplicationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [productType, setProductType] = useState('');
  const [data, setData] = useState<FDADrugApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getFDADrugApplications({
        search: search || undefined,
        product_type: productType || undefined,
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
  }, [search, productType, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); pagination.setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const columns: Column<FDADrugApplication>[] = [
    { key: 'application_number', header: 'App #', mono: true },
    {
      key: 'brand_name',
      header: 'Drug',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-800">{row.brand_name || '—'}</div>
          {row.generic_name && <div className="text-[11px] text-gray-400">{row.generic_name}</div>}
        </div>
      ),
    },
    { key: 'sponsor_name', header: 'Sponsor' },
    { key: 'product_type', header: 'Type', mono: true },
    {
      key: 'approval_date',
      header: 'Approval Date',
      render: (row) => <span className="font-mono text-xs">{row.approval_date ? new Date(row.approval_date).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'designations',
      header: 'Designations',
      render: (row) => {
        const desigs = Object.entries(DESIGNATION_BADGES).filter(([key]) => (row as Record<string, unknown>)[key]);
        return desigs.length ? (
          <div className="flex gap-1">
            {desigs.map(([, { label, color }]) => (
              <span key={label} className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold ${color}`}>{label}</span>
            ))}
          </div>
        ) : <span className="text-gray-300">—</span>;
      },
    },
    {
      key: 'submissions_count',
      header: 'Submissions',
      render: (row) => <span className="font-mono text-xs">{row.submissions_count ?? '—'}</span>,
    },
    {
      key: 'documents_count',
      header: 'Docs',
      render: (row) => <span className="font-mono text-xs">{row.documents_count ?? '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">FDA Drug Applications</h1>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Search drug, sponsor, app #..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="rounded-lg border border-surface-700 bg-surface-950 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 w-72"
            />
          </div>
          <select value={productType} onChange={(e) => { setProductType(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 outline-none focus:border-accent">
            <option value="">All Types</option>
            {PRODUCT_TYPES.filter(Boolean).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      <Card title="Results" padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-700">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-gray-400">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length} className="py-12 text-center text-sm text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />Loading...
                  </div>
                </td></tr>
              ) : !data.length ? (
                <tr><td colSpan={columns.length} className="py-12 text-center text-sm text-gray-400">No applications found</td></tr>
              ) : data.map((row) => (
                <tr
                  key={row.application_number}
                  onClick={() => navigate(`/data/fda-applications/${row.application_number}`)}
                  className="border-b border-surface-800/50 transition-colors hover:bg-surface-950 cursor-pointer"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-2.5 text-gray-700 ${col.mono ? 'font-mono text-xs' : ''}`}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && data.length > 0 && (
          <div className="flex items-center justify-between border-t border-surface-700 px-4 py-3">
            <span className="text-xs text-gray-400">{pagination.total.toLocaleString()} total</span>
            <div className="flex items-center gap-1">
              <button onClick={() => pagination.setPage(pagination.page - 1)} disabled={!pagination.hasPrev}
                className="rounded p-1 text-gray-400 hover:bg-surface-800 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none">
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 font-mono text-xs text-gray-500">{pagination.page}/{pagination.totalPages}</span>
              <button onClick={() => pagination.setPage(pagination.page + 1)} disabled={!pagination.hasNext}
                className="rounded p-1 text-gray-400 hover:bg-surface-800 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
