import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import client from '../../api/client';

interface PurpleBookEntry {
  id: string;
  applicant: string;
  proprietary_name: string;
  proper_name: string;
  bla_number: string;
  product_number: string;
  license_type: string;
  ref_product_proper_name: string;
  ref_prod_proprietary_name: string;
  dosage_form: string;
  route_of_administration: string;
  strength: string;
  product_presentation: string;
  licensure: string;
  status: string;
  approval_date: string;
  date_of_first_licensure: string;
  exclusivity_expiry_date: string;
  ref_product_excl_exp_date: string;
  orphan_excl_expiration_date: string;
  center: string;
  patent_list: string;
}

interface BrowseResponse {
  data: PurpleBookEntry[];
  total: number;
  limit: number;
  offset: number;
}

export default function PurpleBookBrowse() {
  const [searchFilter, setSearchFilter] = useState('');
  const [applicantFilter, setApplicantFilter] = useState('');
  const [licenseTypeFilter, setLicenseTypeFilter] = useState('');
  const [data, setData] = useState<PurpleBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: result } = await client.get<BrowseResponse>('/api/data/browse_purple_book', {
        params: {
          search: searchFilter || undefined,
          applicant: applicantFilter || undefined,
          license_type: licenseTypeFilter || undefined,
          limit: pagination.perPage,
          offset: pagination.offset,
        },
      });
      setData(result.data);
      pagination.setTotal(result.total);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [searchFilter, applicantFilter, licenseTypeFilter, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<PurpleBookEntry>[] = [
    { key: 'bla_number', header: 'BLA #', mono: true, className: 'w-20' },
    { key: 'proprietary_name', header: 'Brand Name', render: (row) => <span className="font-medium">{row.proprietary_name || '—'}</span> },
    { key: 'proper_name', header: 'Proper Name', render: (row) => <div className="max-w-xs truncate" title={row.proper_name}>{row.proper_name}</div> },
    { key: 'applicant', header: 'Applicant', render: (row) => <div className="max-w-xs truncate text-gray-500" title={row.applicant}>{row.applicant}</div> },
    { key: 'license_type', header: 'License', className: 'w-20' },
    { key: 'dosage_form', header: 'Dosage Form' },
    { key: 'route_of_administration', header: 'Route', render: (row) => <div className="max-w-[120px] truncate" title={row.route_of_administration}>{row.route_of_administration}</div> },
    { key: 'strength', header: 'Strength', className: 'w-28' },
    { key: 'licensure', header: 'Status', render: (row) => (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        row.licensure === 'Licensed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
      }`}>{row.licensure}</span>
    )},
    { key: 'approval_date', header: 'Approval Date', className: 'w-32' },
    { key: 'center', header: 'Center', className: 'w-16' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">FDA Purple Book — Licensed Biological Products</h1>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchFilter}
            onChange={(e) => { setSearchFilter(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <input
            type="text"
            placeholder="Applicant..."
            value={applicantFilter}
            onChange={(e) => { setApplicantFilter(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <select
            value={licenseTypeFilter}
            onChange={(e) => { setLicenseTypeFilter(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          >
            <option value="">All License Types</option>
            <option value="351(a)">351(a) — Reference</option>
            <option value="351(k)">351(k) — Biosimilar</option>
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
          emptyMessage="No biological products found"
        />
      </Card>
    </div>
  );
}
