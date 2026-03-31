import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import client from '../../api/client';

interface CIViCEvidence {
  evidence_id: number;
  molecular_profile: string;
  disease: string;
  therapies: string;
  evidence_type: string;
  evidence_direction: string;
  evidence_level: string;
  significance: string;
  evidence_statement: string;
  citation: string;
  nct_ids: string;
  rating: number;
  evidence_status: string;
  variant_origin: string;
}

export default function CIViCBrowse() {
  const [data, setData] = useState<CIViCEvidence[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [gene, setGene] = useState('');
  const [disease, setDisease] = useState('');
  const [therapy, setTherapy] = useState('');
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(page * limit));
    if (search) params.set('search', search);
    if (gene) params.set('gene', gene);
    if (disease) params.set('disease', disease);
    if (therapy) params.set('therapy', therapy);

    client
      .get(`/api/data/civic_evidence?${params}`, { timeout: 60000 })
      .then((res) => { setData(res.data.data); setTotal(res.data.total); })
      .catch(() => { setData([]); setTotal(0); setError('Failed to load CIViC data.'); })
      .finally(() => setLoading(false));
  }, [page, search, gene, disease, therapy]);

  const totalPages = Math.ceil(total / limit);

  const sigColor = (sig: string) => {
    const s = (sig || '').toLowerCase();
    if (s.includes('sensitivity') || s.includes('response')) return 'text-green-600 bg-green-50';
    if (s.includes('resistance')) return 'text-red-600 bg-red-50';
    if (s.includes('poor outcome')) return 'text-orange-600 bg-orange-50';
    if (s.includes('better outcome') || s.includes('positive')) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const levelColor = (level: string) => {
    if (level === 'A') return 'text-green-700 bg-green-100';
    if (level === 'B') return 'text-blue-700 bg-blue-100';
    if (level === 'C') return 'text-yellow-700 bg-yellow-100';
    if (level === 'D') return 'text-orange-700 bg-orange-100';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-gray-400 hover:text-gray-700"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-bold">CIViC Clinical Evidence</h1>
        <span className="text-sm text-gray-500">{total.toLocaleString()} items</span>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-700 bg-surface-950 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent" />
          </div>
          <input type="text" placeholder="Gene / molecular profile..." value={gene}
            onChange={(e) => { setGene(e.target.value); setPage(0); }}
            className="w-full px-3 py-2 rounded-lg border border-surface-700 bg-surface-950 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent" />
          <input type="text" placeholder="Disease..." value={disease}
            onChange={(e) => { setDisease(e.target.value); setPage(0); }}
            className="w-full px-3 py-2 rounded-lg border border-surface-700 bg-surface-950 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent" />
          <input type="text" placeholder="Therapy..." value={therapy}
            onChange={(e) => { setTherapy(e.target.value); setPage(0); }}
            className="w-full px-3 py-2 rounded-lg border border-surface-700 bg-surface-950 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent" />
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-surface-200 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left">Gene/Profile</th>
              <th className="px-3 py-2 text-left">Disease</th>
              <th className="px-3 py-2 text-left">Therapy</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Level</th>
              <th className="px-3 py-2 text-left">Significance</th>
              <th className="px-3 py-2 text-left">Statement</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-red-600">{error}</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-500">No evidence found</td></tr>
            ) : (
              data.map((e) => (
                <tr key={e.evidence_id} className="border-b border-surface-100 hover:bg-surface-50">
                  <td className="px-3 py-2 font-medium max-w-[150px] truncate" title={e.molecular_profile}>{e.molecular_profile}</td>
                  <td className="px-3 py-2 max-w-[140px] truncate" title={e.disease}>{e.disease || '—'}</td>
                  <td className="px-3 py-2 max-w-[120px] truncate" title={e.therapies}>{e.therapies || '—'}</td>
                  <td className="px-3 py-2 text-xs">{e.evidence_type}</td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${levelColor(e.evidence_level)}`}>{e.evidence_level}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${sigColor(e.significance)}`}>{e.significance}</span>
                  </td>
                  <td className="px-3 py-2 max-w-xs truncate text-xs text-gray-600" title={e.evidence_statement}>{e.evidence_statement}</td>
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
