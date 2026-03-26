import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink, FileText } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import { getFDADrugDocuments, getFDADocumentStats } from '../../api/data';
import type { FDADocument, FDADocumentStats } from '../../types/data';

export default function FDADocumentsPage() {
  const [docType, setDocType] = useState('');
  const [extractedOnly, setExtractedOnly] = useState(false);
  const [data, setData] = useState<FDADocument[]>([]);
  const [stats, setStats] = useState<FDADocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const pagination = usePagination(50);

  useEffect(() => {
    getFDADocumentStats().then(setStats).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getFDADrugDocuments({
        doc_type: docType || undefined,
        extracted_only: extractedOnly || undefined,
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
  }, [docType, extractedOnly, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<FDADocument>[] = [
    {
      key: 'application_number',
      header: 'App #',
      mono: true,
      render: (row) => (
        <Link to={`/data/fda-applications/${row.application_number}`} className="text-accent hover:underline" onClick={(e) => e.stopPropagation()}>
          {row.application_number}
        </Link>
      ),
    },
    { key: 'doc_type', header: 'Type' },
    {
      key: 'drug',
      header: 'Drug',
      render: (row) => (
        <div>
          <div className="text-gray-800">{row.brand_names?.[0] || '—'}</div>
          {row.generic_names?.[0] && <div className="text-[10px] text-gray-400">{row.generic_names[0]}</div>}
        </div>
      ),
    },
    { key: 'sponsor_name', header: 'Sponsor' },
    {
      key: 'doc_date',
      header: 'Date',
      render: (row) => <span className="font-mono text-xs">{row.doc_date ? new Date(row.doc_date).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'has_extraction',
      header: 'Extracted',
      render: (row) => row.has_extraction ? (
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Yes</span>
      ) : (
        <span className="text-gray-300">—</span>
      ),
    },
    {
      key: 'expand',
      header: '',
      render: (row) => row.has_extraction ? (
        <button
          onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === row.doc_id ? null : row.doc_id); }}
          className="rounded p-1 text-gray-400 hover:bg-surface-800 hover:text-gray-600"
        >
          {expandedId === row.doc_id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      ) : null,
      className: 'w-10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">FDA Drug Documents</h1>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-surface-700 bg-white p-4">
            <div className="text-xs text-gray-400">Total Documents</div>
            <div className="font-mono text-xl font-bold text-gray-900">{stats.total_documents.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border border-surface-700 bg-white p-4">
            <div className="text-xs text-gray-400">Extracted</div>
            <div className="font-mono text-xl font-bold text-emerald-600">{stats.total_extracted.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border border-surface-700 bg-white p-4 col-span-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Overall Extraction Progress</span>
              <span className="font-mono">{stats.overall_progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-800">
              <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${stats.overall_progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Stats by doc type */}
      {stats && stats.stats.length > 0 && (
        <Card title="Extraction by Document Type" padding={false}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-gray-400">Document Type</th>
                <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-gray-400 text-right">Total</th>
                <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-gray-400 text-right">Extracted</th>
                <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-gray-400 w-48">Progress</th>
              </tr>
            </thead>
            <tbody>
              {stats.stats.map((s) => (
                <tr key={s.doc_type} className="border-b border-surface-800/50">
                  <td className="px-5 py-2.5 text-gray-700 flex items-center gap-2">
                    <FileText size={12} className="text-gray-400" /> {s.doc_type}
                  </td>
                  <td className="px-5 py-2.5 font-mono text-xs text-gray-500 text-right">{s.total_documents.toLocaleString()}</td>
                  <td className="px-5 py-2.5 font-mono text-xs text-emerald-600 text-right">{s.extracted_documents.toLocaleString()}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-800">
                        <div className="h-1.5 rounded-full bg-accent" style={{ width: `${s.extraction_progress}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-gray-400 w-10 text-right">{s.extraction_progress.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Card title="Filters">
        <div className="flex flex-wrap gap-3 items-center">
          <select value={docType} onChange={(e) => { setDocType(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 outline-none focus:border-accent">
            <option value="">All Types</option>
            {(stats?.document_types || []).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={extractedOnly}
              onChange={(e) => { setExtractedOnly(e.target.checked); pagination.setPage(1); }}
              className="rounded border-surface-700 text-accent focus:ring-accent/20"
            />
            Extracted only
          </label>
        </div>
      </Card>

      <Card title="Documents" padding={false}>
        <DataTable
          columns={columns}
          data={data}
          isLoading={loading}
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={pagination.setPage}
          emptyMessage="No documents found"
        />
        {expandedId && data.find((d) => d.doc_id === expandedId) && (
          <ExpandedDoc doc={data.find((d) => d.doc_id === expandedId)!} />
        )}
      </Card>
    </div>
  );
}

function ExpandedDoc({ doc }: { doc: FDADocument }) {
  return (
    <div className="border-t border-surface-700 bg-surface-950 px-6 py-4 space-y-3">
      {doc.doc_url && (
        <a href={doc.doc_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          View source document <ExternalLink size={10} />
        </a>
      )}
      {doc.extracted_data && Object.keys(doc.extracted_data).length > 0 ? (
        <div className="space-y-3">
          {Object.entries(doc.extracted_data).map(([key, value]) => (
            <div key={key}>
              <h5 className="text-xs font-medium uppercase text-gray-400 mb-1">{key.replace(/_/g, ' ')}</h5>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {typeof value === 'string' ? value : (
                  <pre className="text-xs bg-surface-900 rounded p-2 overflow-auto max-h-40">{JSON.stringify(value, null, 2)}</pre>
                )}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No extracted data available</p>
      )}
    </div>
  );
}
