import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import { getConferenceAbstracts } from '../../api/data';
import type { ConferenceAbstract } from '../../types/api';

const CONFERENCES = ['', 'ASCO', 'ASH', 'AACR', 'ESMO', 'SABCS'];
const YEARS = ['', ...Array.from({ length: 10 }, (_, i) => String(2025 - i))];

export default function ConferenceAbstractsPage() {
  const [conference, setConference] = useState('');
  const [year, setYear] = useState('');
  const [disease, setDisease] = useState('');
  const [data, setData] = useState<ConferenceAbstract[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getConferenceAbstracts({
        conference: conference || undefined,
        year: year ? Number(year) : undefined,
        disease: disease || undefined,
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
  }, [conference, year, disease, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<ConferenceAbstract>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (row) => (
        <div className="max-w-sm">
          <div className="truncate text-gray-800 font-medium" title={row.title}>{row.title}</div>
        </div>
      ),
    },
    {
      key: 'conference',
      header: 'Conference',
      mono: true,
      render: (row) => <span>{row.conference} {row.year}</span>,
    },
    { key: 'disease_area', header: 'Disease Area' },
    {
      key: 'drugs_mentioned',
      header: 'Drugs',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.drugs_mentioned?.map((d) => (
            <span key={d} className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">{d}</span>
          )) || <span className="text-gray-300">—</span>}
        </div>
      ),
    },
    {
      key: 'biomarkers_mentioned',
      header: 'Biomarkers',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.biomarkers_mentioned?.map((b) => (
            <span key={b} className="inline-block rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">{b}</span>
          )) || <span className="text-gray-300">—</span>}
        </div>
      ),
    },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">Conference Abstracts</h1>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <select value={conference} onChange={(e) => { setConference(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 outline-none focus:border-accent">
            <option value="">All Conferences</option>
            {CONFERENCES.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={year} onChange={(e) => { setYear(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 outline-none focus:border-accent">
            <option value="">All Years</option>
            {YEARS.filter(Boolean).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <input
            type="text"
            placeholder="Disease area..."
            value={disease}
            onChange={(e) => { setDisease(e.target.value); pagination.setPage(1); }}
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
          emptyMessage="No conference abstracts found"
        />
        {/* Expanded row detail */}
        {expandedId && data.find((d) => d.id === expandedId) && (
          <ExpandedRow abstract={data.find((d) => d.id === expandedId)!} />
        )}
      </Card>
    </div>
  );
}

function ExpandedRow({ abstract: a }: { abstract: ConferenceAbstract }) {
  return (
    <div className="border-t border-surface-700 bg-surface-950 px-6 py-4 space-y-3">
      <div>
        <h4 className="text-xs font-medium uppercase text-gray-400 mb-1">Full Abstract</h4>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {(a as unknown as Record<string, unknown>).abstract_text as string || 'No abstract text available'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-1">Authors</h4>
          <p className="text-sm text-gray-600">{a.first_authors?.join(', ') || '—'}</p>
        </div>
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-1">Trial IDs</h4>
          <p className="text-sm text-gray-600 font-mono">
            {((a as unknown as Record<string, unknown>).trial_ids as string[])?.join(', ') || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
