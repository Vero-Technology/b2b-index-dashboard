import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import client from '../../api/client';

type TabKey = 'products' | 'patents' | 'exclusivity';

const TABS: { key: TabKey; label: string; endpoint: string }[] = [
  { key: 'products', label: 'Products', endpoint: '/api/data/browse_orange_book_products' },
  { key: 'patents', label: 'Patents', endpoint: '/api/data/browse_orange_book_patents' },
  { key: 'exclusivity', label: 'Exclusivity', endpoint: '/api/data/browse_orange_book_exclusivity' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const productColumns: Column<any>[] = [
  { key: 'appl_type', header: 'Type', className: 'w-14' },
  { key: 'appl_no', header: 'Appl #', mono: true, className: 'w-20' },
  { key: 'trade_name', header: 'Trade Name', render: (r) => <span className="font-medium">{r.trade_name || '—'}</span> },
  { key: 'ingredient', header: 'Ingredient', render: (r) => <div className="max-w-xs truncate" title={r.ingredient}>{r.ingredient}</div> },
  { key: 'applicant', header: 'Applicant', render: (r) => <div className="max-w-[180px] truncate text-gray-500" title={r.applicant_full_name}>{r.applicant}</div> },
  { key: 'strength', header: 'Strength', className: 'w-32' },
  { key: 'df_route', header: 'DF/Route', render: (r) => <div className="max-w-[140px] truncate" title={r.df_route}>{r.df_route}</div> },
  { key: 'te_code', header: 'TE', className: 'w-16' },
  { key: 'rld', header: 'RLD', className: 'w-12' },
  { key: 'approval_date', header: 'Approved', className: 'w-28' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const patentColumns: Column<any>[] = [
  { key: 'appl_type', header: 'Type', className: 'w-14' },
  { key: 'appl_no', header: 'Appl #', mono: true, className: 'w-20' },
  { key: 'product_no', header: 'Prod #', className: 'w-16' },
  { key: 'patent_no', header: 'Patent #', mono: true, render: (r) => <span className="font-medium">{r.patent_no}</span> },
  { key: 'patent_expire_date', header: 'Expires', className: 'w-32' },
  { key: 'drug_substance_flag', header: 'Substance', className: 'w-20' },
  { key: 'drug_product_flag', header: 'Product', className: 'w-20' },
  { key: 'patent_use_code', header: 'Use Code', className: 'w-24' },
  { key: 'delist_flag', header: 'Delist', className: 'w-16' },
  { key: 'submission_date', header: 'Submitted', className: 'w-28' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const exclusivityColumns: Column<any>[] = [
  { key: 'appl_type', header: 'Type', className: 'w-14' },
  { key: 'appl_no', header: 'Appl #', mono: true, className: 'w-24' },
  { key: 'product_no', header: 'Product #', className: 'w-24' },
  { key: 'exclusivity_code', header: 'Exclusivity Code', render: (r) => <span className="font-medium">{r.exclusivity_code}</span> },
  { key: 'exclusivity_date', header: 'Exclusivity Date', className: 'w-36' },
];

const COLUMNS_MAP = {
  products: productColumns,
  patents: patentColumns,
  exclusivity: exclusivityColumns,
};

export default function OrangeBookBrowse() {
  const [tab, setTab] = useState<TabKey>('products');
  const [filter1, setFilter1] = useState('');
  const [filter2, setFilter2] = useState('');
  const [applType, setApplType] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const activeTab = TABS.find((t) => t.key === tab)!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = { limit: pagination.perPage, offset: pagination.offset };

      if (tab === 'products') {
        if (filter1) params.ingredient = filter1;
        if (filter2) params.trade_name = filter2;
        if (applType) params.appl_type = applType;
      } else if (tab === 'patents') {
        if (filter1) params.appl_no = filter1;
        if (filter2) params.patent_no = filter2;
        if (applType) params.appl_type = applType;
      } else {
        if (filter1) params.appl_no = filter1;
        if (filter2) params.exclusivity_code = filter2;
      }

      const { data: result } = await client.get(activeTab.endpoint, { params });
      setData(result.data);
      pagination.setTotal(result.total);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tab, filter1, filter2, applType, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTabChange = (key: TabKey) => {
    setTab(key);
    setFilter1('');
    setFilter2('');
    setApplType('');
    pagination.setPage(1);
  };

  const placeholder1 = tab === 'products' ? 'Ingredient...' : 'Application #...';
  const placeholder2 = tab === 'products' ? 'Trade name...' : tab === 'patents' ? 'Patent #...' : 'Exclusivity code...';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">FDA Orange Book — Drug Patents &amp; Exclusivity</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-300 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-accent text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder={placeholder1}
            value={filter1}
            onChange={(e) => { setFilter1(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <input
            type="text"
            placeholder={placeholder2}
            value={filter2}
            onChange={(e) => { setFilter2(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          {tab !== 'exclusivity' && (
            <select
              value={applType}
              onChange={(e) => { setApplType(e.target.value); pagination.setPage(1); }}
              className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            >
              <option value="">All Types</option>
              <option value="N">NDA (N)</option>
              <option value="A">ANDA (A)</option>
            </select>
          )}
        </div>
      </Card>

      <Card title="Results" padding={false}>
        <DataTable
          columns={COLUMNS_MAP[tab]}
          data={data}
          isLoading={loading}
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={pagination.setPage}
          emptyMessage="No records found"
        />
      </Card>
    </div>
  );
}
