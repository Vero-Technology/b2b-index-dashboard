import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { getFDAApplicationDetail } from '../../api/data';
import type { FDAApplicationDetail, FDADocument } from '../../types/data';

const DESIGNATION_BADGES: Record<string, { label: string; full: string; color: string }> = {
  fast_track: { label: 'FT', full: 'Fast Track', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  breakthrough_therapy: { label: 'BT', full: 'Breakthrough Therapy', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  accelerated_approval: { label: 'AA', full: 'Accelerated Approval', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  orphan_drug: { label: 'OD', full: 'Orphan Drug', color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export default function FDAApplicationDetailPage() {
  const { appNumber } = useParams<{ appNumber: string }>();
  const [detail, setDetail] = useState<FDAApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDetail() {
    if (!appNumber) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getFDAApplicationDetail(appNumber);
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDetail(); }, [appNumber]);

  if (loading) {
    return (
      <div className="space-y-6">
        <BackLink />
        <div className="flex items-center gap-2 py-12 text-sm text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Loading application...
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-6">
        <BackLink />
        <Card>
          <div className="flex flex-col items-center gap-3 py-8 text-sm text-gray-500">
            <AlertCircle size={24} className="text-red-400" />
            <p>{error || 'Application not found'}</p>
            <button onClick={fetchDetail} className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90">
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const app = detail.application;
  const desigs = Object.entries(DESIGNATION_BADGES).filter(([key]) => (app as Record<string, unknown>)[key]);

  return (
    <div className="space-y-6">
      <BackLink />

      {/* Overview */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{app.brand_name || app.application_number}</h1>
            {app.generic_name && <p className="text-sm text-gray-500">{app.generic_name}</p>}
            <p className="mt-1 text-xs text-gray-400">Sponsor: {app.sponsor_name || '—'}</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-lg font-bold text-accent">{app.application_number}</div>
            <div className="text-xs text-gray-400">{app.product_type || 'Unknown type'}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          {app.approval_date && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Calendar size={14} className="text-gray-400" />
              Approved: {new Date(app.approval_date).toLocaleDateString()}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <FileText size={14} className="text-gray-400" />
            {detail.documents.length} documents, {detail.submissions.length} submissions
          </div>
        </div>

        {desigs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {desigs.map(([, { full, color }]) => (
              <span key={full} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${color}`}>{full}</span>
            ))}
          </div>
        )}
      </Card>

      {/* Submissions Timeline */}
      <Card title={`Submissions (${detail.submissions.length})`}>
        {detail.submissions.length === 0 ? (
          <p className="text-sm text-gray-400">No submissions</p>
        ) : (
          <div className="relative space-y-0">
            {detail.submissions.map((sub, i) => (
              <div key={sub.submission_number || i} className="flex gap-4 pb-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-accent" />
                  {i < detail.submissions.length - 1 && <div className="flex-1 w-px bg-surface-700 mt-1" />}
                </div>
                <div className="flex-1 -mt-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs font-medium text-gray-800">{sub.submission_number}</span>
                    <span className="text-xs text-gray-400">{sub.submission_type}</span>
                    {sub.review_priority && (
                      <span className="rounded-full bg-surface-800 px-1.5 py-0.5 text-[10px] text-gray-500">{sub.review_priority}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {sub.submission_status && <span className="text-xs text-gray-500">{sub.submission_status}</span>}
                    {sub.submission_status_date && (
                      <span className="font-mono text-[10px] text-gray-400">
                        {new Date(sub.submission_status_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Documents */}
      <Card title={`Documents (${detail.documents.length})`} padding={false}>
        {detail.documents.length === 0 ? (
          <div className="p-5 text-sm text-gray-400">No documents</div>
        ) : (
          <div className="divide-y divide-surface-800/50">
            {detail.documents.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function DocumentRow({ doc }: { doc: FDADocument }) {
  const [expanded, setExpanded] = useState(false);
  const hasExtracted = doc.extracted_data && Object.keys(doc.extracted_data).length > 0;

  return (
    <div>
      <div
        className={`flex items-center justify-between px-5 py-3 ${hasExtracted ? 'cursor-pointer hover:bg-surface-950' : ''}`}
        onClick={() => hasExtracted && setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">{doc.title || doc.document_type || 'Document'}</span>
            {doc.document_type && <span className="rounded-full bg-surface-800 px-1.5 py-0.5 text-[10px] text-gray-500">{doc.document_type}</span>}
          </div>
          {doc.document_url && (
            <a href={doc.document_url} target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-accent hover:underline" onClick={(e) => e.stopPropagation()}>
              View source ↗
            </a>
          )}
        </div>
        {hasExtracted && (
          <button className="rounded p-1 text-gray-400 hover:bg-surface-800">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>
      {expanded && doc.extracted_data && (
        <div className="border-t border-surface-800/50 bg-surface-950 px-5 py-4 space-y-3">
          {doc.extracted_data.efficacy_summary && (
            <ExtractedSection title="Efficacy Summary" content={doc.extracted_data.efficacy_summary} />
          )}
          {doc.extracted_data.safety_summary && (
            <ExtractedSection title="Safety Summary" content={doc.extracted_data.safety_summary} />
          )}
          {doc.extracted_data.clinical_trials && doc.extracted_data.clinical_trials.length > 0 && (
            <div>
              <h5 className="text-xs font-medium uppercase text-gray-400 mb-1">Clinical Trials</h5>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-0.5">
                {doc.extracted_data.clinical_trials.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
          {doc.extracted_data.reviewer_concerns && doc.extracted_data.reviewer_concerns.length > 0 && (
            <div>
              <h5 className="text-xs font-medium uppercase text-gray-400 mb-1">Reviewer Concerns</h5>
              <ul className="list-disc list-inside text-sm text-red-600/80 space-y-0.5">
                {doc.extracted_data.reviewer_concerns.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExtractedSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h5 className="text-xs font-medium uppercase text-gray-400 mb-1">{title}</h5>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function BackLink() {
  return (
    <div className="flex items-center gap-3">
      <Link to="/data/fda-applications" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
        <ArrowLeft size={16} />
      </Link>
      <h1 className="font-display text-lg font-semibold text-gray-800">Application Detail</h1>
    </div>
  );
}
