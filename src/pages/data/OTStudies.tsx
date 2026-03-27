import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import client from '../../api/client';

interface OTStudy {
  studyid: string;
  traitfromsource: string;
  studytype: string;
  pubmedid: string;
  publicationtitle: string;
  publicationdate: string;
  publicationfirstauthor: string;
  nsamples: number;
  ncases: number;
}

export default function OTStudiesPage() {
  const [traitFilter, setTraitFilter] = useState('');
  const [studyIdFilter, setStudyIdFilter] = useState('');
  const [data, setData] = useState<OTStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: pagination.perPage,
        offset: pagination.offset,
      };
      if (traitFilter) params.trait = traitFilter;
      if (studyIdFilter) params.study_id = studyIdFilter;

      const { data: result } = await client.get('/api/data/ot_studies', { params });
      setData(result.data || []);
      pagination.setTotal(result.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [traitFilter, studyIdFilter, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<OTStudy>[] = [
    { 
      key: 'studyid', 
      header: 'Study ID',
      className: 'font-mono text-xs w-40',
    },
    { 
      key: 'traitfromsource', 
      header: 'Trait',
      render: (row) => (
        <div className="max-w-sm">
          <div className="text-sm text-gray-800 line-clamp-2">{row.traitfromsource || '—'}</div>
          {row.publicationtitle && (
            <div className="text-xs text-gray-400 mt-0.5">{row.publicationtitle}</div>
          )}
        </div>
      ),
    },
    { 
      key: 'pubmedid', 
      header: 'PubMed',
      className: 'w-24',
      render: (row) => row.pubmedid ? (
        <a 
          href={`https://pubmed.ncbi.nlm.nih.gov/${row.pubmedid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-accent hover:underline"
        >
          {row.pubmedid} <ExternalLink size={10} />
        </a>
      ) : <span className="text-gray-400">—</span>,
    },
    { 
      key: 'publicationdate', 
      header: 'Date',
      className: 'w-24 text-xs',
    },
    { 
      key: 'nsamples', 
      header: 'Samples',
      className: 'w-20 text-right',
      render: (row) => (
        <span className="text-xs">{row.nsamples?.toLocaleString() || '—'}</span>
      ),
    },
    { 
      key: 'ncases', 
      header: 'Cases',
      className: 'w-16 text-right',
      render: (row) => (
        <span className="text-xs">{row.ncases?.toLocaleString() || '—'}</span>
      ),
    },
    { key: 'studytype', header: 'Type', className: 'w-24 text-xs' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">Open Targets — GWAS Studies</h1>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Trait (e.g. diabetes, cancer)..."
            value={traitFilter}
            onChange={(e) => { setTraitFilter(e.target.value); pagination.setPage(1); }}
            className="flex-1 min-w-[200px] rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <input
            type="text"
            placeholder="Study ID..."
            value={studyIdFilter}
            onChange={(e) => { setStudyIdFilter(e.target.value); pagination.setPage(1); }}
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
          emptyMessage="No studies found"
        />
      </Card>
    </div>
  );
}
