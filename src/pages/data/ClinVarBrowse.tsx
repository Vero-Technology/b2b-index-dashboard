import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import client from '../../api/client';

interface ClinVarVariant {
  variation_id: number;
  allele_id: number;
  variation_type: string;
  variation_name: string;
  gene_symbol: string;
  clinical_significance: string;
  phenotype_list: string;
  review_status: string;
  chromosome: string;
  start_pos: number;
  stop_pos: number;
  rs_dbsnp: string;
  origin_simple: string;
  number_submitters: number;
  last_evaluated: string;
  assembly: string;
}

export default function ClinVarBrowse() {
  const [data, setData] = useState<ClinVarVariant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [gene, setGene] = useState('');
  const [significance, setSignificance] = useState('');
  const [phenotype, setPhenotype] = useState('');
  const [search, setSearch] = useState('');
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(page * limit));
    if (gene) params.set('gene', gene);
    if (significance) params.set('significance', significance);
    if (phenotype) params.set('phenotype', phenotype);
    if (search) params.set('search', search);

    client
      .get(`/api/data/clinvar_variants?${params}`, { timeout: 60000 })
      .then((res) => {
        setData(res.data.data);
        setTotal(res.data.total);
      })
      .catch((err) => {
        setData([]);
        setTotal(0);
        if (err.code === 'ECONNABORTED') {
          setError('Request timed out. Try narrowing your search.');
        } else {
          setError('Failed to load ClinVar data.');
        }
      })
      .finally(() => setLoading(false));
  }, [page, gene, significance, phenotype, search]);

  const totalPages = Math.ceil(total / limit);

  const sigColor = (sig: string) => {
    const s = (sig || '').toLowerCase();
    if (s.includes('pathogenic') && !s.includes('benign')) return 'text-red-600 bg-red-50';
    if (s.includes('benign')) return 'text-green-600 bg-green-50';
    if (s.includes('uncertain')) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">ClinVar Variants</h1>
        <span className="text-sm text-gray-500">{total.toLocaleString()} variants</span>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-700 bg-surface-950 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent" />
          </div>
          <input type="text" placeholder="Gene symbol..." value={gene}
            onChange={(e) => { setGene(e.target.value); setPage(0); }}
            className="w-full px-3 py-2 rounded-lg border border-surface-700 bg-surface-950 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent" />
          <input type="text" placeholder="Clinical significance..." value={significance}
            onChange={(e) => { setSignificance(e.target.value); setPage(0); }}
            className="w-full px-3 py-2 rounded-lg border border-surface-700 bg-surface-950 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent" />
          <input type="text" placeholder="Phenotype / condition..." value={phenotype}
            onChange={(e) => { setPhenotype(e.target.value); setPage(0); }}
            className="w-full px-3 py-2 rounded-lg border border-surface-700 bg-surface-950 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent" />
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-surface-200 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left">Gene</th>
              <th className="px-3 py-2 text-left">Variant</th>
              <th className="px-3 py-2 text-left">Significance</th>
              <th className="px-3 py-2 text-left">Phenotype</th>
              <th className="px-3 py-2 text-left">Chr</th>
              <th className="px-3 py-2 text-left">Review</th>
              <th className="px-3 py-2 text-left">dbSNP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-red-600">{error}</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-500">No variants found</td></tr>
            ) : (
              data.map((v) => (
                <tr key={`${v.variation_id}-${v.assembly}`} className="border-b border-surface-100 hover:bg-surface-50">
                  <td className="px-3 py-2 font-medium">{v.gene_symbol || '—'}</td>
                  <td className="px-3 py-2 max-w-xs truncate" title={v.variation_name}>{v.variation_name}</td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${sigColor(v.clinical_significance)}`}>
                      {v.clinical_significance}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-xs truncate" title={v.phenotype_list}>{v.phenotype_list || '—'}</td>
                  <td className="px-3 py-2">{v.chromosome}</td>
                  <td className="px-3 py-2 text-xs text-gray-500 max-w-[120px] truncate" title={v.review_status}>{v.review_status}</td>
                  <td className="px-3 py-2">
                    {v.rs_dbsnp && v.rs_dbsnp !== '-1' ? (
                      <a href={`https://www.ncbi.nlm.nih.gov/snp/rs${v.rs_dbsnp}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">rs{v.rs_dbsnp}</a>
                    ) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {page + 1} of {totalPages.toLocaleString()}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-1 hover:text-gray-700 disabled:opacity-30"><ChevronLeft size={18} /></button>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-1 hover:text-gray-700 disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
