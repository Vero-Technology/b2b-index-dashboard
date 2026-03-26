import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import { getClinicalTrials, getClinicalTrialsFilters } from '../../api/data';

interface ClinicalTrial {
  nct_id: string;
  brief_title: string;
  overall_status: string;
  phase: string | null;
  enrollment: number | null;
  study_type: string;
  start_date: string | null;
  completion_date: string | null;
  lead_sponsor: string | null;
  conditions: string[] | null;
}

export default function ClinicalTrialsPage() {
  const [phase, setPhase] = useState('');
  const [status, setStatus] = useState('');
  const [studyType, setStudyType] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [data, setData] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ phases: string[]; statuses: string[]; study_types: string[] }>({
    phases: [], statuses: [], study_types: [],
  });
  const pagination = usePagination(20);

  useEffect(() => {
    getClinicalTrialsFilters().then(setFilters).catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getClinicalTrials({
        phase: phase || undefined,
        status: status || undefined,
        study_type: studyType || undefined,
        search: debouncedSearch || undefined,
        limit: pagination.perPage,
        offset: pagination.offset,
      });
      setData(result.data as unknown as ClinicalTrial[]);
      pagination.setTotal(result.total);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [phase, status, studyType, debouncedSearch, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<ClinicalTrial>[] = [
    {
      key: 'nct_id',
      header: 'NCT ID',
      mono: true,
      render: (row) => (
        <a
          href={`https://clinicaltrials.gov/study/${row.nct_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline font-mono text-xs"
        >
          {row.nct_id}
        </a>
      ),
    },
    {
      key: 'brief_title',
      header: 'Title',
      render: (row) => (
        <div className="max-w-xs truncate text-gray-800 font-medium" title={row.brief_title}>
          {row.brief_title}
        </div>
      ),
    },
    {
      key: 'overall_status',
      header: 'Status',
      render: (row) => {
        const color = row.overall_status === 'RECRUITING' ? 'bg-green-50 text-green-700'
          : row.overall_status === 'COMPLETED' ? 'bg-blue-50 text-blue-700'
          : row.overall_status === 'TERMINATED' || row.overall_status === 'WITHDRAWN' ? 'bg-red-50 text-red-700'
          : 'bg-gray-50 text-gray-600';
        return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>{row.overall_status}</span>;
      },
    },
    { key: 'phase', header: 'Phase', render: (row) => <span className="text-xs">{row.phase || '—'}</span> },
    { key: 'enrollment', header: 'Enrollment', render: (row) => <span className="text-xs font-mono">{row.enrollment?.toLocaleString() ?? '—'}</span> },
    { key: 'study_type', header: 'Type', render: (row) => <span className="text-xs">{row.study_type}</span> },
    {
      key: 'lead_sponsor',
      header: 'Lead Sponsor',
      render: (row) => (
        <div className="max-w-[150px] truncate text-xs text-gray-600" title={row.lead_sponsor || ''}>
          {row.lead_sponsor || '—'}
        </div>
      ),
    },
    {
      key: 'conditions',
      header: 'Conditions',
      render: (row) => {
        const conds = row.conditions || [];
        const display = conds.slice(0, 3).join(', ');
        const extra = conds.length > 3 ? ` +${conds.length - 3}` : '';
        return (
          <div className="max-w-[200px] truncate text-xs text-gray-500" title={conds.join(', ')}>
            {display ? display + extra : '—'}
          </div>
        );
      },
    },
  ];

  const selectClass = "rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 outline-none focus:border-accent";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">Clinical Trials (AACT)</h1>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <select value={phase} onChange={(e) => { setPhase(e.target.value); pagination.setPage(1); }} className={selectClass}>
            <option value="">All Phases</option>
            {filters.phases.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); pagination.setPage(1); }} className={selectClass}>
            <option value="">All Statuses</option>
            {filters.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={studyType} onChange={(e) => { setStudyType(e.target.value); pagination.setPage(1); }} className={selectClass}>
            <option value="">All Study Types</option>
            {filters.study_types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            type="text"
            placeholder="Search titles..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); pagination.setPage(1); }}
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
          emptyMessage="No clinical trials found"
        />
      </Card>
    </div>
  );
}
