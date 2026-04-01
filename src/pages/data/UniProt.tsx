import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import client from '../../api/client';

interface UniProtRow {
  accession: string;
  gene_names: string;
  protein_name: string;
  length: number;
  function: string;
  disease_involvement: string;
  drugbank_ids: string;
  chembl_ids: string;
  keywords: string;
}

export default function UniProtPage() {
  const [data, setData] = useState<UniProtRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (search) params.set('keyword', search);
      const { data: res } = await client.get(`/api/data/browse_uniprot?${params}`);
      setData(res.data);
      setTotal(res.total);
    } catch { setData([]); setTotal(0); }
    finally { setLoading(false); }
  }, [search, offset]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setOffset(0); }, [search]);

  const columns: Column<UniProtRow>[] = [
    { key: 'accession', header: 'Accession', mono: true },
    { key: 'gene_names', header: 'Gene' },
    { key: 'protein_name', header: 'Protein', render: (r) => <span className="text-xs">{r.protein_name?.slice(0, 80)}</span> },
    { key: 'length', header: 'Length' },
    { key: 'disease_involvement', header: 'Disease', render: (r) => <span className="text-xs">{r.disease_involvement?.slice(0, 100)}</span> },
    { key: 'drugbank_ids', header: 'DrugBank' },
    { key: 'chembl_ids', header: 'ChEMBL' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700"><ArrowLeft size={16} /></Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">UniProt Proteins</h1>
      </div>
      <Card title="Search">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input type="text" placeholder="Search gene, protein, disease..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-surface-700 bg-surface-950 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 w-80" />
        </div>
      </Card>
      <Card title={`Proteins (${total.toLocaleString()})`} padding={false}>
        <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="No proteins found" />
        {total > limit && (
          <div className="flex items-center justify-between border-t border-surface-800 px-4 py-3">
            <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}
              className="rounded px-3 py-1 text-xs text-gray-600 hover:bg-surface-800 disabled:opacity-30">Previous</button>
            <span className="text-xs text-gray-400">{offset + 1}–{Math.min(offset + limit, total)} of {total.toLocaleString()}</span>
            <button disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}
              className="rounded px-3 py-1 text-xs text-gray-600 hover:bg-surface-800 disabled:opacity-30">Next</button>
          </div>
        )}
      </Card>
    </div>
  );
}
