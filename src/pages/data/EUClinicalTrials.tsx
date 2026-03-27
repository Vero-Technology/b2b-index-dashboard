import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import client from '../../api/client';

interface EUClinicalTrial {
  id: number;
  eudract_number: string;
  title: string;
  sponsor_name: string;
  trial_status: string;
  phase: string;
  medical_conditions: string[];
  imp_names: string[];
  date_entered: string;
  source_url: string;
}

export default function EUClinicalTrialsPage() {
  const [sponsorFilter, setSponsorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [data, setData] = useState<EUClinicalTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: pagination.perPage,
        offset: pagination.offset,
      };
      if (sponsorFilter) params.sponsor = sponsorFilter;
      if (statusFilter) params.status = statusFilter;
      if (phaseFilter) params.phase = phaseFilter;
      if (searchFilter) params.search = searchFilter;

      const { data: result } = await client.get('/api/data/eu_clinical_trials', { params });
      setData(result.data || []);
      pagination.setTotal(result.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [sponsorFilter, statusFilter, phaseFilter, searchFilter, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<EUClinicalTrial>[] = [
    { 
      key: 'eudract_number', 
      header: 'EudraCT Number',
      className: 'w-32 font-mono text-xs',
    },
    { 
      key: 'title', 
      header: 'Title',
      render: (row) => (
        <div className="max-w-md">
          <div className="text-sm text-gray-800 line-clamp-2">{row.title || '—'}</div>
          {row.medical_conditions && row.medical_conditions.length > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              {row.medical_conditions.slice(0, 2).join(', ')}
              {row.medical_conditions.length > 2 && ` +${row.medical_conditions.length - 2}`}
            </div>
          )}
        </div>
      ),
    },
    { key: 'sponsor_name', header: 'Sponsor', className: 'w-40' },
    { 
      key: 'trial_status', 
      header: 'Status',
      className: 'w-28',
      render: (row) => {
        const status = row.trial_status || '';
        const color = status.toLowerCase().includes('completed') ? 'text-green-600' :
                      status.toLowerCase().includes('ongoing') ? 'text-blue-600' :
                      status.toLowerCase().includes('terminated') ? 'text-red-600' : 'text-gray-600';
        return <span className={`text-xs font-medium ${color}`}>{status}</span>;
      },
    },
    { 
      key: 'phase', 
      header: 'Phase',
      className: 'w-24 text-center',
      render: (row) => (
        <span className="text-xs">{row.phase || '—'}</span>
      ),
    },
    { 
      key: 'imp_names', 
      header: 'IMPs',
      className: 'w-32',
      render: (row) => (
        <div className="text-xs text-gray-600">
          {row.imp_names?.slice(0, 2).join(', ') || '—'}
          {row.imp_names && row.imp_names.length > 2 && ` +${row.imp_names.length - 2}`}
        </div>
      ),
    },
    { 
      key: 'date_entered', 
      header: 'Entered',
      className: 'w-24',
      render: (row) => (
        <span className="text-xs text-gray-500">{row.date_entered || '—'}</span>
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
        <h1 className="font-display text-lg font-semibold text-gray-800">EU Clinical Trials Register</h1>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search title or EudraCT..."
            value={searchFilter}
            onChange={(e) => { setSearchFilter(e.target.value); pagination.setPage(1); }}
            className="flex-1 min-w-[200px] rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <input
            type="text"
            placeholder="Sponsor name..."
            value={sponsorFilter}
            onChange={(e) => { setSponsorFilter(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          >
            <option value="">All Statuses</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Terminated">Terminated</option>
            <option value="Not Authorised">Not Authorised</option>
          </select>
          <select
            value={phaseFilter}
            onChange={(e) => { setPhaseFilter(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          >
            <option value="">All Phases</option>
            <option value="Phase I">Phase I</option>
            <option value="Phase II">Phase II</option>
            <option value="Phase III">Phase III</option>
            <option value="Phase IV">Phase IV</option>
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
          emptyMessage="No EU clinical trials found"
        />
      </Card>
    </div>
  );
}
