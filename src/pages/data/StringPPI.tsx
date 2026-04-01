import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import client from '../../api/client';

interface PPIRow { protein1: string; name1: string; protein2: string; name2: string; combined_score: number; }

export default function StringPPIPage() {
  const [data, setData] = useState<PPIRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState(700);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset), min_score: String(minScore) });
      if (search) params.set('protein', search);
      const { data: res } = await client.get(`/api/data/browse_string_ppi?${params}`);
      setData(res.data); setTotal(res.total);
    } catch { setData([]); setTotal(0); } finally { setLoading(false); }
  }, [search, minScore, offset]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setOffset(0); }, [search, minScore]);

  const columns: Column<PPIRow>[] = [
    { key: 'name1', header: 'Protein 1' },
    { key: 'name2', header: 'Protein 2' },
    { key: 'combined_score', header: 'Score', render: (r) => <span className={r.combined_score >= 900 ? 'text-emerald-600 font-medium' : r.combined_score >= 700 ? 'text-amber-600' : 'text-gray-500'}>{r.combined_score}</span> },
    { key: 'protein1', header: 'STRING ID 1', mono: true },
    { key: 'protein2', header: 'STRING ID 2', mono: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700"><ArrowLeft size={16} /></Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">STRING Protein-Protein Interactions</h1>
      </div>
      <Card title="Filters">
        <div className="flex gap-4">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input type="text" placeholder="Search protein name..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-surface-700 bg-surface-950 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Min score:</label>
            <input type="number" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} min={0} max={1000} step={50}
              className="w-20 rounded-lg border border-surface-700 bg-surface-950 py-2 px-2 text-sm text-gray-800 outline-none focus:border-accent" />
          </div>
        </div>
      </Card>
      <Card title={`Interactions (${total.toLocaleString()})`} padding={false}>
        <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="No interactions found" />
        {total > limit && (
          <div className="flex items-center justify-between border-t border-surface-800 px-4 py-3">
            <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))} className="rounded px-3 py-1 text-xs text-gray-600 hover:bg-surface-800 disabled:opacity-30">Previous</button>
            <span className="text-xs text-gray-400">{offset + 1}–{Math.min(offset + limit, total)} of {total.toLocaleString()}</span>
            <button disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)} className="rounded px-3 py-1 text-xs text-gray-600 hover:bg-surface-800 disabled:opacity-30">Next</button>
          </div>
        )}
      </Card>
    </div>
  );
}
