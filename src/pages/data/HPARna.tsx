import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import client from '../../api/client';

interface HPARnaRow { gene: string; gene_name: string; tissue: string; tpm: number; }

export default function HPARnaPage() {
  const [data, setData] = useState<HPARnaRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gene, setGene] = useState('');
  const [tissue, setTissue] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (gene) params.set('gene', gene);
      if (tissue) params.set('tissue', tissue);
      const { data: res } = await client.get(`/api/data/browse_hpa_rna?${params}`);
      setData(res.data); setTotal(res.total);
    } catch { setData([]); setTotal(0); } finally { setLoading(false); }
  }, [gene, tissue, offset]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setOffset(0); }, [gene, tissue]);

  const columns: Column<HPARnaRow>[] = [
    { key: 'gene', header: 'Gene', mono: true },
    { key: 'gene_name', header: 'Gene Name' },
    { key: 'tissue', header: 'Tissue' },
    { key: 'tpm', header: 'TPM', render: (r) => <span className={r.tpm > 100 ? 'text-emerald-600 font-medium' : r.tpm > 10 ? 'text-amber-600' : 'text-gray-500'}>{r.tpm?.toFixed(1)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700"><ArrowLeft size={16} /></Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">HPA RNA Tissue Expression</h1>
      </div>
      <Card title="Filters">
        <div className="flex gap-4">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input type="text" placeholder="Gene name..." value={gene} onChange={(e) => setGene(e.target.value)}
              className="rounded-lg border border-surface-700 bg-surface-950 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 w-48" />
          </div>
          <input type="text" placeholder="Tissue..." value={tissue} onChange={(e) => setTissue(e.target.value)}
            className="rounded-lg border border-surface-700 bg-surface-950 py-2 px-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 w-48" />
        </div>
      </Card>
      <Card title={`RNA Expression (${total.toLocaleString()})`} padding={false}>
        <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="No records found" />
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
