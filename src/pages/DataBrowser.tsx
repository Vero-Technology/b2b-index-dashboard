import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { usePagination } from '../hooks/usePagination';
import {
  getConferenceAbstracts,
  getEmaEpars,
  getAdcomMembers,
} from '../api/data';
import type { ConferenceAbstract, EmaEpar, AdcomMember } from '../types/api';

type Tab = 'abstracts' | 'ema' | 'adcom';

const TABS: { key: Tab; label: string }[] = [
  { key: 'abstracts', label: 'Conference Abstracts' },
  { key: 'ema', label: 'EMA EPARs' },
  { key: 'adcom', label: 'AdCom Members' },
];

export default function DataBrowser() {
  const [tab, setTab] = useState<Tab>('abstracts');

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-surface-900 p-1 border border-surface-700/50">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-amber-500/15 text-amber-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'abstracts' && <AbstractsTab />}
      {tab === 'ema' && <EmaTab />}
      {tab === 'adcom' && <AdcomTab />}
    </div>
  );
}

function AbstractsTab() {
  const [conference, setConference] = useState('');
  const [year, setYear] = useState('');
  const [disease, setDisease] = useState('');
  const [data, setData] = useState<ConferenceAbstract[]>([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(20);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: Column<ConferenceAbstract>[] = [
    { key: 'conference', header: 'Conference', mono: true },
    { key: 'year', header: 'Year', mono: true },
    {
      key: 'title',
      header: 'Title',
      render: (row) => (
        <div className="max-w-md truncate text-gray-200" title={row.title}>
          {row.title}
        </div>
      ),
    },
    {
      key: 'first_authors',
      header: 'Authors',
      render: (row) => (
        <span className="text-gray-400">
          {row.first_authors?.join(', ') || '—'}
        </span>
      ),
    },
    { key: 'disease_area', header: 'Disease' },
  ];

  return (
    <>
      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <FilterInput
            placeholder="Conference (e.g. ASCO)"
            value={conference}
            onChange={(v) => { setConference(v); pagination.setPage(1); }}
          />
          <FilterInput
            placeholder="Year"
            value={year}
            onChange={(v) => { setYear(v); pagination.setPage(1); }}
          />
          <FilterInput
            placeholder="Disease area"
            value={disease}
            onChange={(v) => { setDisease(v); pagination.setPage(1); }}
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
      </Card>
    </>
  );
}

function EmaTab() {
  const [therapeuticArea, setTherapeuticArea] = useState('');
  const [data, setData] = useState<EmaEpar[]>([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(20);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: Column<EmaEpar>[] = [
    { key: 'product_name', header: 'Product', mono: true },
    { key: 'active_substance', header: 'Substance' },
    { key: 'therapeutic_area', header: 'Therapeutic Area' },
    {
      key: 'indication',
      header: 'Indication',
      render: (row) => (
        <div className="max-w-xs truncate text-gray-400" title={row.indication || ''}>
          {row.indication || '—'}
        </div>
      ),
    },
    { key: 'marketing_auth_holder', header: 'MAH' },
  ];

  return (
    <>
      <Card title="Filters">
        <FilterInput
          placeholder="Therapeutic area"
          value={therapeuticArea}
          onChange={(v) => { setTherapeuticArea(v); pagination.setPage(1); }}
        />
      </Card>
      <Card title="Results" padding={false}>
        <DataTable
          columns={columns}
          data={data }
          isLoading={loading}
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={pagination.setPage}
          emptyMessage="No EMA EPARs found"
        />
      </Card>
    </>
  );
}

function AdcomTab() {
  const [data, setData] = useState<AdcomMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const members = await getAdcomMembers();
        setData(members);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const columns: Column<AdcomMember>[] = [
    { key: 'full_name', header: 'Name' },
    { key: 'committee', header: 'Committee', mono: true },
    { key: 'role', header: 'Role' },
    { key: 'institution', header: 'Institution' },
    { key: 'specialty', header: 'Specialty' },
    {
      key: 'is_current',
      header: 'Current',
      render: (row) => (
        <span className={row.is_current ? 'text-emerald-400' : 'text-gray-600'}>
          {row.is_current ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <Card title="Advisory Committee Members" padding={false}>
      <DataTable
        columns={columns}
        data={data }
        isLoading={loading}
        emptyMessage="No AdCom members found"
      />
    </Card>
  );
}

function FilterInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-surface-600 bg-surface-800 py-2 pl-9 pr-3 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors focus:border-amber-500/50"
      />
    </div>
  );
}
