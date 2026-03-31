import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import client from '../../api/client';

interface Patent {
  patent_id: string;
  patent_title: string;
  patent_date: string;
  patent_type: string;
  num_claims: number;
  cpc_codes: string[];
  assignees: { name: string; type: string; location: string }[];
  inventors: { name: string; location: string }[];
  citation_count: number;
}

export default function USPTOPatents() {
  const [data, setData] = useState<Patent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [assignee, setAssignee] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [sort, setSort] = useState('citation_count');
  const [order, setOrder] = useState('desc');
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(page * limit));
    params.set('sort', sort);
    params.set('order', order);
    if (search) params.set('search', search);
    if (assignee) params.set('assignee', assignee);
    if (yearFrom) params.set('year_from', yearFrom);
    if (yearTo) params.set('year_to', yearTo);

    client
      .get(`/api/data/uspto_pharma_patents?${params}`, { timeout: 60000 })
      .then((res) => {
        setData(res.data.data);
        setTotal(res.data.total);
      })
      .catch((err) => {
        setData([]);
        setTotal(0);
        if (err.code === 'ECONNABORTED') {
          setError('Patent browse request timed out. Try again.');
        } else if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 422) {
          setError('Patent browse auth failed. Refresh login/API key and retry.');
        } else {
          setError('Failed to load patent data.');
        }
      })
      .finally(() => setLoading(false));
  }, [page, search, assignee, yearFrom, yearTo, sort, order]);

  const totalPages = Math.ceil(total / limit);

  const handleSort = (col: string) => {
    if (sort === col) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSort(col);
      setOrder('desc');
    }
    setPage(0);
  };

  const SortHeader = ({ col, label }: { col: string; label: string }) => (
    <th
      className="px-3 py-2 text-left cursor-pointer hover:text-accent select-none"
      onClick={() => handleSort(col)}
    >
      {label} {sort === col ? (order === 'desc' ? '↓' : '↑') : ''}
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">USPTO Pharma Patents</h1>
        <span className="text-sm text-gray-500">
          {total.toLocaleString()} patents
        </span>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search title or abstract..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-700 bg-surface-950 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            />
          </div>
          <input
            type="text"
            placeholder="Assignee (company)..."
            value={assignee}
            onChange={(e) => {
              setAssignee(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 rounded-lg border border-surface-700 bg-surface-950 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <input
            type="number"
            placeholder="Year from"
            value={yearFrom}
            onChange={(e) => {
              setYearFrom(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 rounded-lg border border-surface-700 bg-surface-950 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <input
            type="number"
            placeholder="Year to"
            value={yearTo}
            onChange={(e) => {
              setYearTo(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 rounded-lg border border-surface-700 bg-surface-950 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-surface-200 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left">Patent ID</th>
              <th className="px-3 py-2 text-left">Title</th>
              <SortHeader col="patent_date" label="Date" />
              <th className="px-3 py-2 text-left">Assignee</th>
              <SortHeader col="citation_count" label="Citations" />
              <SortHeader col="num_claims" label="Claims" />
              <th className="px-3 py-2 text-left">CPC Codes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                  No patents found
                </td>
              </tr>
            ) : (
              data.map((p) => (
                <tr
                  key={p.patent_id}
                  className="border-b border-surface-100 hover:bg-surface-50"
                >
                  <td className="px-3 py-2">
                    <a
                      href={`https://patents.google.com/patent/US${p.patent_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {p.patent_id}
                    </a>
                  </td>
                  <td className="px-3 py-2 max-w-md truncate" title={p.patent_title}>
                    {p.patent_title}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{p.patent_date}</td>
                  <td className="px-3 py-2 max-w-xs truncate">
                    {p.assignees?.map((a) => a.name).join(', ') || '—'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {p.citation_count?.toLocaleString() || 0}
                  </td>
                  <td className="px-3 py-2 text-right">{p.num_claims}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {p.cpc_codes?.slice(0, 3).map((c) => (
                        <span
                          key={c}
                          className="px-1.5 py-0.5 bg-surface-100 border border-surface-200 rounded text-xs text-gray-600"
                        >
                          {c}
                        </span>
                      ))}
                      {(p.cpc_codes?.length || 0) > 3 && (
                        <span className="text-xs text-gray-400">
                          +{p.cpc_codes.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Page {page + 1} of {totalPages.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1 hover:text-gray-700 disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 hover:text-gray-700 disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
