import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import { getSECFilings, type SECFiling } from '../../api/data';

export default function SECFilingsPage() {
  const [companyFilter, setCompanyFilter] = useState('');
  const [formType, setFormType] = useState('');
  const [data, setData] = useState<SECFiling[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSECFilings({
        company: companyFilter || undefined,
        form_type: formType || undefined,
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
  }, [companyFilter, formType, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<SECFiling>[] = [
    { key: 'company', header: 'Company' },
    { key: 'form_type', header: 'Form', className: 'w-20' },
    { key: 'filing_date', header: 'Filing Date', className: 'w-28' },
    { 
      key: 'crl_count', 
      header: 'CRLs',
      className: 'w-16 text-center',
      render: (row) => (
        <span className={row.crl_count > 0 ? 'font-medium text-red-600' : 'text-gray-400'}>
          {row.crl_count}
        </span>
      ),
    },
    { 
      key: 'pipeline_count', 
      header: 'Pipeline',
      className: 'w-20 text-center',
      render: (row) => (
        <span className={row.pipeline_count > 0 ? 'font-medium text-blue-600' : 'text-gray-400'}>
          {row.pipeline_count}
        </span>
      ),
    },
    { 
      key: 'patent_count', 
      header: 'Patents',
      className: 'w-20 text-center',
      render: (row) => (
        <span className={row.patent_count > 0 ? 'font-medium text-amber-600' : 'text-gray-400'}>
          {row.patent_count}
        </span>
      ),
    },
    {
      key: 'expand',
      header: '',
      render: (row) => {
        const hasData = row.crl_count > 0 || row.pipeline_count > 0 || row.patent_count > 0 || (row.litigation_count || 0) > 0;
        return hasData ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === row.id ? null : row.id); }}
            className="rounded p-1 text-gray-400 hover:bg-surface-800 hover:text-gray-600"
          >
            {expandedId === row.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        ) : null;
      },
      className: 'w-10',
    },
    {
      key: 'link',
      header: '',
      render: (row) => row.source_url ? (
        <a 
          href={row.source_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-accent"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={14} />
        </a>
      ) : null,
      className: 'w-10',
    },
  ];

  const expandedRow = data.find((d) => d.id === expandedId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">SEC Filings (10-K/10-Q)</h1>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Company name..."
            value={companyFilter}
            onChange={(e) => { setCompanyFilter(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
          <select
            value={formType}
            onChange={(e) => { setFormType(e.target.value); pagination.setPage(1); }}
            className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          >
            <option value="">All Forms</option>
            <option value="10-K">10-K</option>
            <option value="10-Q">10-Q</option>
            <option value="8-K">8-K</option>
          </select>
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
          emptyMessage="No SEC filings found"
        />
      </Card>

      {expandedRow && (
        <Card title={`${expandedRow.company} — Extracted Data`}>
          <div className="space-y-6 text-sm">
            {/* CRLs */}
            {expandedRow.crls && expandedRow.crls.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                  🚫 Complete Response Letters ({expandedRow.crls.length})
                </h4>
                <div className="space-y-3">
                  {expandedRow.crls.map((crl, i) => (
                    <div key={i} className="rounded-lg bg-red-50 p-3 border border-red-100">
                      <div className="font-medium text-gray-800">{String(crl.drug_name ?? 'Unknown Drug')}</div>
                      <div className="text-gray-600 text-xs mt-1">{String(crl.indication ?? '')}</div>
                      {Array.isArray(crl.rejection_reasons) && crl.rejection_reasons.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Reasons: </span>
                          <span className="text-xs text-red-700">{crl.rejection_reasons.map(String).join(', ')}</span>
                        </div>
                      )}
                      {crl.crl_date && <div className="text-xs text-gray-400 mt-1">Date: {String(crl.crl_date)}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pipeline Drugs */}
            {expandedRow.pipeline_drugs && expandedRow.pipeline_drugs.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  💊 Pipeline Drugs ({expandedRow.pipeline_drugs.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {expandedRow.pipeline_drugs.map((drug, i) => (
                    <div key={i} className="rounded-lg bg-blue-50 p-3 border border-blue-100">
                      <div className="font-medium text-gray-800">{String(drug.drug_name ?? drug.name ?? 'Unknown')}</div>
                      <div className="text-xs text-gray-600">{String(drug.indication ?? drug.therapeutic_area ?? '')}</div>
                      {drug.phase && <div className="text-xs text-blue-600 mt-1">Phase: {String(drug.phase)}</div>}
                      {drug.status && <div className="text-xs text-gray-500">Status: {String(drug.status)}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patents */}
            {expandedRow.patent_expirations && expandedRow.patent_expirations.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
                  📜 Patent Expirations ({expandedRow.patent_expirations.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {expandedRow.patent_expirations.map((patent, i) => (
                    <div key={i} className="rounded-lg bg-amber-50 p-3 border border-amber-100">
                      <div className="font-medium text-gray-800">{String(patent.drug_name ?? patent.product ?? 'Unknown')}</div>
                      {patent.expiration_date && <div className="text-xs text-amber-700">Expires: {String(patent.expiration_date)}</div>}
                      {patent.patent_number && <div className="text-xs text-gray-500">Patent: {String(patent.patent_number)}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Litigation */}
            {expandedRow.litigation && expandedRow.litigation.length > 0 && (
              <div>
                <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                  ⚖️ Litigation ({expandedRow.litigation.length})
                </h4>
                <div className="space-y-2">
                  {expandedRow.litigation.map((lit, i) => (
                    <div key={i} className="rounded-lg bg-purple-50 p-3 border border-purple-100">
                      <div className="font-medium text-gray-800">{String(lit.case_name ?? lit.description ?? 'Litigation matter')}</div>
                      {lit.status && <div className="text-xs text-purple-600">Status: {String(lit.status)}</div>}
                      {lit.drug_name && <div className="text-xs text-gray-500">Drug: {String(lit.drug_name)}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
