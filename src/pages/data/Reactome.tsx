import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import client from '../../api/client';

interface ReactomeRow { pathway_id: string; pathway_name: string; species: string; protein_count: number; }

export default function ReactomePage() {
  const [data, setData] = useState<ReactomeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (search) params.set('name', search);
      const { data: res } = await client.get(`/api/data/browse_reactome_pathways?${params}`);
      setData(res.data); setTotal(res.total);
    } catch { setData([]); setTotal(0); } finally { setLoading(false); }
  }, [search, offset]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setOffset(0); }, [search]);

  const columns: Column<ReactomeRow>[] = [
    { key: 'pathway_id', header: 'Pathway ID', mono: true },
    { key: 'pathway_name', header: 'Pathway Name' },
    { key: 'species', header: 'Species' },
    { key: 'protein_count', header: 'Proteins' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700"><ArrowLeft size={16} /></Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">Reactome Pathways</h1>
      </div>
      <Card title="Search">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input type="text" placeholder="Search pathway name..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-surface-700 bg-surface-950 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 w-80" />
        </div>
      </Card>
      <Card title={`Pathways (${total.toLocaleString()})`} padding={false}>
        <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="No pathways found" />
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
