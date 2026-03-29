// Data browser types — matches actual backend API

export interface SourceIndex {
  indexname: string;
  size: string;
}

export interface FieldQuality {
  populated: number;
  rate: number;
}

export interface SourceStatus {
  source: string;
  label: string;
  category?: string;
  table_name: string;
  row_count: number;
  extraction_type: 'llm' | 'none';
  extracted_count: number;
  extraction_progress: number;
  indexes: SourceIndex[];
  index_count: number;
  table_size: string;
  data_size: string;
  field_quality: Record<string, FieldQuality>;
}

export interface SourceQuality {
  source: string;
  table: string;
  total_rows: number;
  field_quality: Record<string, FieldQuality>;
  sample_records: Record<string, unknown>[];
}

export interface FDADrugApplication {
  id: number;
  application_number: string;
  sponsor_name: string | null;
  brand_names: string[] | null;
  generic_names: string[] | null;
  substance_names: string[] | null;
  product_type: string | null;
  route: string[] | null;
  created_at: string | null;
}

export interface FDASubmission {
  submission_type: string | null;
  submission_number: string;
  submission_status: string | null;
  submission_status_date: string | null;
  review_priority: string | null;
  submission_class_code: string | null;
  submission_class_description: string | null;
}

export interface FDADocument {
  doc_id: string;
  id?: number;
  application_number?: string | null;
  doc_type: string | null;
  doc_url: string | null;
  doc_date: string | null;
  has_extraction: boolean;
  extracted_data: Record<string, unknown> | null;
  sponsor_name?: string | null;
  brand_names?: string[] | null;
  generic_names?: string[] | null;
}

export interface FDAApplicationDetail {
  application: FDADrugApplication;
  submissions: FDASubmission[];
  documents: FDADocument[];
}

export interface FDADocumentStats {
  stats: {
    doc_type: string;
    total_documents: number;
    extracted_documents: number;
    extraction_progress: number;
  }[];
  total_documents: number;
  total_extracted: number;
  overall_progress: number;
  document_types: string[];
}

export interface AdcomDocument {
  document_id: number;
  committee: string | null;
  meeting_date: string | null;
  drug_name: string | null;
  sponsor: string | null;
  indication: string | null;
  document_type: string | null;
  vote_result: string | null;
  vote_yes: number | null;
  vote_no: number | null;
  vote_abstain: number | null;
  key_concerns: string[] | null;
  safety_signals: string[] | null;
  efficacy_data: Record<string, unknown> | null;
  pdf_url: string | null;
  source_url: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
