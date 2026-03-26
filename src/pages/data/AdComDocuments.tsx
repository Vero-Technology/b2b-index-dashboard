import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import { getAdcomDocuments } from '../../api/data';
import type { AdcomDocument } from '../../types/data';

export default function AdComDocumentsPage() {
  const [committee, setCommittee] = useState('');
  const [drug, setDrug] = useState('');
  const [data, setData] = useState<AdcomDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdcomDocuments({
        committee: committee || undefined,
        drug: drug || undefined,
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
  }, [committee, drug, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<AdcomDocument>[] = [
    { key: 'committee_name', header: 'Committee', mono: true },
    { key: 'drug_name', header: 'Drug' },
    {
      key: 'drug_sponsor',
      header: 'Sponsor',
      render: (row) => <span className="text-xs text-gray-600">{row.drug_sponsor || '—'}</span>,
    },
    {
      key: 'meeting_date',
      header: 'Meeting Date',
      render: (row) => <span className="font-mono text-xs">{row.meeting_date ? new Date(row.meeting_date).toLocaleDateString() : '—'}</span>,
    },
    { key: 'document_type', header: 'Type' },
    {
      key: 'vote_result',
      header: 'Vote',
      render: (row) => {
        if (!row.vote_result && row.vote_yes == null) return <span className="text-gray-300">—</span>;
        return (
          <div className="flex items-center gap-1.5">
            {row.vote_result && <span className="text-xs font-medium text-gray-700">{row.vote_result}</span>}
            {row.vote_yes != null && (
              <span className="text-[10px] text-gray-400">
                (<span className="text-emerald-600">{row.vote_yes}Y</span>/<span className="text-red-500">{row.vote_no}N</span>/<span className="text-gray-400">{row.vote_abstain}A</span>)
              </span>
            )}
          </div>
        );
      },
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
        <h1 className="font-display text-lg font-semibold text-gray-800">AdCom Documents</h1>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input type="text" placeholder="Committee..." value={committee}
              onChange={(e) => { setCommittee(e.target.value); pagination.setPage(1); }}
              className="rounded-lg border border-surface-700 bg-surface-950 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20" />
          </div>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input type="text" placeholder="Drug name..." value={drug}
              onChange={(e) => { setDrug(e.target.value); pagination.setPage(1); }}
              className="rounded-lg border border-surface-700 bg-surface-950 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20" />
          </div>
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
          emptyMessage="No AdCom documents found"
        />
        {expandedId && data.find((d) => d.id === expandedId) && (
          <ExpandedAdcom doc={data.find((d) => d.id === expandedId)!} />
        )}
      </Card>
    </div>
  );
}

function ExpandedAdcom({ doc }: { doc: AdcomDocument }) {
  return (
    <div className="border-t border-surface-700 bg-surface-950 px-6 py-4 space-y-3">
      {doc.indication && (
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-1">Indication</h4>
          <p className="text-sm text-gray-700">{doc.indication}</p>
        </div>
      )}
      {doc.key_concerns && doc.key_concerns.length > 0 && (
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-1">Key Concerns</h4>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
            {doc.key_concerns.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}
      {doc.safety_signals && doc.safety_signals.length > 0 && (
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-1">Safety Signals</h4>
          <ul className="list-disc list-inside text-sm text-red-600/80 space-y-0.5">
            {doc.safety_signals.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
      {doc.efficacy_data && Object.keys(doc.efficacy_data).length > 0 && (
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-1">Efficacy Data</h4>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-surface-900 rounded-lg p-3 text-xs">
            {JSON.stringify(doc.efficacy_data, null, 2)}
          </pre>
        </div>
      )}
      {doc.reviewer_concerns && (
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-1">Reviewer Concerns</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{doc.reviewer_concerns}</p>
        </div>
      )}
      {doc.source_url && (
        <div>
          <a href={doc.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">
            View source ↗
          </a>
        </div>
      )}
      {!doc.key_concerns?.length && !doc.safety_signals?.length && !doc.efficacy_data && !doc.reviewer_concerns && (
        <p className="text-sm text-gray-400">No extracted details available</p>
      )}
    </div>
  );
}
