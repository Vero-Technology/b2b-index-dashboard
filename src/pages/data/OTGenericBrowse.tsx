import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { usePagination } from '../../hooks/usePagination';
import client from '../../api/client';

const OT_TABLE_META: Record<string, { label: string; endpoint: string; columns?: string[]; headers?: Record<string, string> }> = {
  'ot-interactions': {
    label: 'Protein Interactions',
    endpoint: 'ot_interactions',
    columns: ['target_a_name', 'target_b_name', 'sourcedatabase', 'interactor_a_name', 'interactor_b_name', 'scoring', 'count'],
    headers: { target_a_name: 'Target A', target_b_name: 'Target B', sourcedatabase: 'Source DB', interactor_a_name: 'Interactor A', interactor_b_name: 'Interactor B', scoring: 'Score', count: 'Count' },
  },
  'ot-studies': {
    label: 'GWAS Studies',
    endpoint: 'ot_studies',
    columns: ['studyid', 'traitreported', 'traitmapped', 'pubmedid', 'publicationdate', 'numassocloci', 'nsamples', 'source'],
    headers: { studyid: 'Study ID', traitreported: 'Trait Reported', traitmapped: 'Trait Mapped', pubmedid: 'PubMed', publicationdate: 'Date', numassocloci: 'Loci', nsamples: 'Samples', source: 'Source' },
  },
  'ot-literature': {
    label: 'Literature',
    endpoint: 'ot_literature',
    columns: ['pmid', 'pmcid', 'journal', 'keyword', 'year'],
    headers: { pmid: 'PMID', pmcid: 'PMCID', journal: 'Journal', keyword: 'Keyword', year: 'Year' },
  },
  'ot-colocalisation': {
    label: 'Colocalisation',
    endpoint: 'ot_colocalisation',
    columns: ['leftstudyid', 'rightstudyid', 'leftgeneentrezid', 'rightgeneentrezid', 'chromosome', 'colocalisationmethod', 'h4', 'log2h4h3'],
    headers: { leftstudyid: 'Left Study', rightstudyid: 'Right Study', leftgeneentrezid: 'Left Gene', rightgeneentrezid: 'Right Gene', chromosome: 'Chr', colocalisationmethod: 'Method', h4: 'H4', log2h4h3: 'log2(H4/H3)' },
  },
  'ot-disease-phenotype': {
    label: 'Disease Phenotypes',
    endpoint: 'ot_disease_phenotype',
    columns: ['disease_name', 'phenotype_name', 'diseaseid', 'phenotype'],
    headers: { disease_name: 'Disease', phenotype_name: 'Phenotype', diseaseid: 'Disease ID', phenotype: 'Phenotype ID' },
  },
  'ot-mouse-phenotype': {
    label: 'Mouse Phenotypes',
    endpoint: 'ot_mouse_phenotype',
    columns: ['target_symbol', 'targetinmodel', 'modelphenotypelabel', 'modelphenotypeid'],
    headers: { target_symbol: 'Gene', targetinmodel: 'Mouse Gene', modelphenotypelabel: 'Phenotype', modelphenotypeid: 'Phenotype ID' },
  },
  'ot-pharmacogenomics': {
    label: 'Pharmacogenomics',
    endpoint: 'ot_pharmacogenomics',
    columns: ['gene_symbol', 'drug_names', 'variant', 'evidencelevel', 'phenotypetext', 'pgxcategory', 'datasourceid'],
    headers: { gene_symbol: 'Gene', drug_names: 'Drugs', variant: 'Variant', evidencelevel: 'Evidence', phenotypetext: 'Phenotype', pgxcategory: 'Category', datasourceid: 'Source' },
  },
  'ot-target-prioritisation': {
    label: 'Target Prioritisation',
    endpoint: 'ot_target_prioritisation',
    columns: ['target_symbol', 'target_name', 'hassafetyevent', 'haspocket', 'hasligand', 'hassmallmoleculebinder', 'iscancerdrivergene', 'maxclinicalstage'],
    headers: { target_symbol: 'Symbol', target_name: 'Target Name', hassafetyevent: 'Safety Event', haspocket: 'Pocket', hasligand: 'Ligand', hassmallmoleculebinder: 'Small Mol.', iscancerdrivergene: 'Cancer Driver', maxclinicalstage: 'Max Clinical' },
  },
  'chembl-molecules': {
    label: 'Molecules',
    endpoint: 'chembl_molecules',
    columns: ['chembl_id', 'pref_name', 'molecule_type', 'max_phase', 'first_approval', 'therapeutic_flag', 'oral', 'black_box_warning', 'natural_product', 'first_in_class'],
    headers: { chembl_id: 'ChEMBL ID', pref_name: 'Name', molecule_type: 'Type', max_phase: 'Max Phase', first_approval: 'First Approval', therapeutic_flag: 'Therapeutic', oral: 'Oral', black_box_warning: 'Black Box', natural_product: 'Natural', first_in_class: 'First in Class' },
  },
  'chembl-activities': {
    label: 'Bioactivities',
    endpoint: 'chembl_activities',
    columns: ['chembl_id', 'compound_name', 'standard_type', 'standard_relation', 'standard_value', 'standard_units', 'pchembl_value'],
    headers: { chembl_id: 'ChEMBL ID', compound_name: 'Compound', standard_type: 'Assay Type', standard_relation: 'Relation', standard_value: 'Value', standard_units: 'Units', pchembl_value: 'pChEMBL' },
  },
  'chembl-targets': {
    label: 'Drug Targets',
    endpoint: 'chembl_targets',
    columns: ['chembl_id', 'pref_name', 'target_type', 'organism'],
    headers: { chembl_id: 'ChEMBL ID', pref_name: 'Target Name', target_type: 'Type', organism: 'Organism' },
  },
  'chembl-mechanisms': {
    label: 'Drug Mechanisms',
    endpoint: 'chembl_mechanisms',
    columns: ['compound_id', 'compound_name', 'mechanism_of_action', 'action_type', 'direct_interaction', 'target_name', 'target_type', 'organism'],
    headers: { compound_id: 'Compound ID', compound_name: 'Compound', mechanism_of_action: 'Mechanism', action_type: 'Action', direct_interaction: 'Direct', target_name: 'Target', target_type: 'Target Type', organism: 'Organism' },
  },
  'chembl-indications': {
    label: 'Drug Indications',
    endpoint: 'chembl_indications',
    columns: ['chembl_id', 'compound_name', 'max_phase', 'mesh_heading', 'max_phase_for_ind'],
    headers: { chembl_id: 'ChEMBL ID', compound_name: 'Compound', max_phase: 'Max Phase', mesh_heading: 'Indication', max_phase_for_ind: 'Phase for Indication' },
  },
};

export default function OTGenericBrowsePage() {
  const location = useLocation();
  const table = location.pathname.split('/data/')[1];
  const meta = table ? OT_TABLE_META[table] : null;
  const [searchFilter, setSearchFilter] = useState('');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<Column<Record<string, unknown>>[]>([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination(50);

  const fetchData = useCallback(async () => {
    if (!meta) return;
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: pagination.perPage,
        offset: pagination.offset,
      };
      if (searchFilter) params.search = searchFilter;

      const { data: result } = await client.get(`/api/data/${meta.endpoint}`, { params });
      const rows = result.data || [];
      setData(rows);
      pagination.setTotal(result.total || 0);

      // Use preferred columns if defined, otherwise auto-detect from first row
      if (rows.length > 0) {
        const rowKeys = Object.keys(rows[0]);
        const keys = meta.columns
          ? meta.columns.filter(k => rowKeys.includes(k))
          : rowKeys.filter(k => k !== 'id' && typeof rows[0][k] !== 'object').slice(0, 8);
        const hdrs = meta.headers || {};
        setColumns(keys.map(k => ({
          key: k,
          header: hdrs[k] || k.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          className: 'text-xs',
          render: (row: Record<string, unknown>) => {
            const val = row[k];
            if (val === null || val === undefined) return <span className="text-gray-300">—</span>;
            if (typeof val === 'number') return <span className="font-mono">{val.toLocaleString()}</span>;
            const str = String(val);
            return <span className="line-clamp-2">{str.length > 100 ? str.slice(0, 100) + '…' : str}</span>;
          },
        })));
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [meta, searchFilter, pagination.perPage, pagination.offset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!meta) {
    return <div className="py-8 text-center text-gray-400">Unknown OT table</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">
          {table?.startsWith('chembl') ? 'ChEMBL' : 'Open Targets'} — {meta.label}
        </h1>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchFilter}
            onChange={(e) => { setSearchFilter(e.target.value); pagination.setPage(1); }}
            className="flex-1 min-w-[200px] rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
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
          emptyMessage="No data found"
        />
      </Card>
    </div>
  );
}
