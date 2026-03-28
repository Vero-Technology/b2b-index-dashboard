import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import client from '../../api/client';

const PHARMGKB_TABLES = [
  {
    key: 'relationships',
    label: 'Relationships',
    endpoint: 'browse_pharmgkb_relationships',
    columns: ['entity1_name', 'entity1_type', 'entity2_name', 'entity2_type', 'evidence', 'association', 'pk', 'pd'],
    headers: { entity1_name: 'Entity 1', entity1_type: 'Type 1', entity2_name: 'Entity 2', entity2_type: 'Type 2', evidence: 'Evidence', association: 'Association', pk: 'PK', pd: 'PD' } as Record<string, string>,
    filters: [
      { key: 'entity_name', label: 'Entity Name', type: 'text' as const },
      { key: 'entity1_type', label: 'Entity 1 Type', type: 'select' as const, options: ['Gene', 'Chemical', 'Disease', 'Variant', 'Haplotype'] },
      { key: 'association', label: 'Association', type: 'select' as const, options: ['associated', 'not associated', 'ambiguous'] },
    ],
  },
  {
    key: 'clinical_annotations',
    label: 'Clinical Annotations',
    endpoint: 'browse_pharmgkb_clinical_annotations',
    columns: ['clinical_annotation_id', 'variant_haplotypes', 'gene', 'level_of_evidence', 'phenotype_category', 'drugs', 'phenotypes', 'score'],
    headers: { clinical_annotation_id: 'ID', variant_haplotypes: 'Variant/Haplotype', gene: 'Gene', level_of_evidence: 'Evidence Level', phenotype_category: 'Phenotype Category', drugs: 'Drug(s)', phenotypes: 'Phenotype(s)', score: 'Score' } as Record<string, string>,
    filters: [
      { key: 'gene', label: 'Gene', type: 'text' as const },
      { key: 'drug', label: 'Drug', type: 'text' as const },
      { key: 'level_of_evidence', label: 'Evidence Level', type: 'select' as const, options: ['1A', '1B', '2A', '2B', '3', '4'] },
    ],
  },
  {
    key: 'drugs',
    label: 'Drugs',
    endpoint: 'browse_pharmgkb_drugs',
    columns: ['pharmgkb_accession_id', 'name', 'type', 'clinical_annotation_count', 'variant_annotation_count', 'top_clinical_annotation_level', 'top_fda_label_testing_level', 'dosing_guideline_sources'],
    headers: { pharmgkb_accession_id: 'PharmGKB ID', name: 'Name', type: 'Type', clinical_annotation_count: 'Clinical Ann.', variant_annotation_count: 'Variant Ann.', top_clinical_annotation_level: 'Top Clin. Level', top_fda_label_testing_level: 'FDA Label Level', dosing_guideline_sources: 'Dosing Guidelines' } as Record<string, string>,
    filters: [
      { key: 'name', label: 'Drug Name', type: 'text' as const },
      { key: 'drug_type', label: 'Type', type: 'select' as const, options: ['Drug', 'Drug Class', 'Biological Intermediate', 'Ion', 'Metabolite', 'Prodrug'] },
    ],
  },
  {
    key: 'genes',
    label: 'Genes',
    endpoint: 'browse_pharmgkb_genes',
    columns: ['pharmgkb_accession_id', 'symbol', 'name', 'chromosome', 'is_vip', 'has_variant_annotation', 'has_cpic_dosing_guideline'],
    headers: { pharmgkb_accession_id: 'PharmGKB ID', symbol: 'Symbol', name: 'Name', chromosome: 'Chr', is_vip: 'VIP', has_variant_annotation: 'Has Variants', has_cpic_dosing_guideline: 'CPIC Guideline' } as Record<string, string>,
    filters: [
      { key: 'symbol', label: 'Gene Symbol', type: 'text' as const },
      { key: 'name', label: 'Gene Name', type: 'text' as const },
      { key: 'chromosome', label: 'Chromosome', type: 'text' as const },
    ],
  },
  {
    key: 'drug_labels',
    label: 'Drug Labels',
    endpoint: 'browse_pharmgkb_drug_labels',
    columns: ['pharmgkb_id', 'name', 'source', 'biomarker_flag', 'testing_level', 'has_prescribing_info', 'has_dosing_info', 'has_alternate_drug', 'chemicals', 'genes'],
    headers: { pharmgkb_id: 'ID', name: 'Name', source: 'Source', biomarker_flag: 'Biomarker', testing_level: 'Testing Level', has_prescribing_info: 'Prescribing', has_dosing_info: 'Dosing', has_alternate_drug: 'Alt Drug', chemicals: 'Chemicals', genes: 'Genes' } as Record<string, string>,
    filters: [
      { key: 'name', label: 'Label Name', type: 'text' as const },
      { key: 'source', label: 'Source', type: 'select' as const, options: ['FDA', 'EMA', 'HCSC', 'PMDA', 'Swissmedic'] },
      { key: 'testing_level', label: 'Testing Level', type: 'select' as const, options: ['Testing required', 'Testing recommended', 'Actionable PGx', 'Informative PGx'] },
    ],
  },
];

export default function PharmGKBBrowsePage() {
  const [activeTab, setActiveTab] = useState(PHARMGKB_TABLES[0].key);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(50);

  const activeTable = PHARMGKB_TABLES.find(t => t.key === activeTab)!;

  const columns: Column<Record<string, unknown>>[] = activeTable.columns.map(k => ({
    key: k,
    header: activeTable.headers[k] || k.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    className: 'text-xs',
    render: (row: Record<string, unknown>) => {
      const val = row[k];
      if (val === null || val === undefined) return <span className="text-gray-300">—</span>;
      const str = String(val);
      return <span className="line-clamp-2">{str.length > 120 ? str.slice(0, 120) + '…' : str}</span>;
    },
  }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: pagination.perPage,
        offset: pagination.offset,
      };
      for (const [k, v] of Object.entries(filterValues)) {
        if (v) params[k] = v;
      }
      const { data: result } = await client.get(`/api/data/${activeTable.endpoint}`, { params });
      setData(result.data || []);
      pagination.setTotal(result.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTable, filterValues, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setFilterValues({});
    setData([]);
    pagination.setPage(1);
  };

  const updateFilter = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    pagination.setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">
          PharmGKB — Pharmacogenomics Knowledge Base
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-surface-900 p-1">
        {PHARMGKB_TABLES.map(t => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              activeTab === t.key
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          {activeTable.filters.map(f => (
            f.type === 'text' ? (
              <input
                key={f.key}
                type="text"
                placeholder={f.label}
                value={filterValues[f.key] || ''}
                onChange={e => updateFilter(f.key, e.target.value)}
                className="min-w-[160px] rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            ) : (
              <select
                key={f.key}
                value={filterValues[f.key] || ''}
                onChange={e => updateFilter(f.key, e.target.value)}
                className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              >
                <option value="">{f.label} (All)</option>
                {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )
          ))}
        </div>
      </Card>

      <Card title={`${activeTable.label} Results`} padding={false}>
        <DataTable
          columns={columns}
          data={data}
          isLoading={loading}
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={pagination.setPage}
          emptyMessage={`No ${activeTable.label.toLowerCase()} found`}
        />
      </Card>
    </div>
  );
}
