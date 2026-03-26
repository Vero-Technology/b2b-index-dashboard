// Data browser types

export interface FDADrugApplication {
  application_number: string;
  sponsor_name: string | null;
  brand_names: string[] | null;
  generic_names: string[] | null;
  substance_names: string[] | null;
  product_type: string | null;
  route: string[] | null;
  products: unknown | null;
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
  application_number?: string | null;
  doc_type: string | null;
  doc_url: string | null;
  doc_date: string | null;
  extracted_text?: string | null;
  extracted_data: Record<string, unknown> | null;
  has_extraction?: boolean;
  sponsor_name?: string | null;
  brand_names?: string[] | null;
  generic_names?: string[] | null;
}

export interface FDAApplicationDetail {
  application: FDADrugApplication;
  submissions: FDASubmission[];
  documents: FDADocument[];
}

export interface AdcomDocument {
  id: number;
  committee_name: string | null;
  drug_name: string | null;
  drug_sponsor: string | null;
  meeting_date: string | null;
  indication: string | null;
  document_type: string | null;
  vote_result: string | null;
  vote_yes: number | null;
  vote_no: number | null;
  vote_abstain: number | null;
  key_concerns: string[] | null;
  efficacy_data: Record<string, unknown> | null;
  safety_signals: string[] | null;
  reviewer_concerns: string | null;
  source_url: string | null;
}

export interface SourceStatus {
  source: string;
  table_name: string;
  row_count: number;
  extracted_count: number;
  extraction_progress: number;
  last_updated: string | null;
}

export interface SourceQuality {
  source: string;
  field_null_rates: Record<string, number>;
  samples: Record<string, unknown>[];
}

export interface DrugRegulatoryData {
  drug_name: string;
  fda: FDADrugApplication | null;
  ema: import('../types/api').EmaEpar | null;
  adcom_documents: AdcomDocument[];
  abstracts: import('../types/api').ConferenceAbstract[];
}

export interface SearchResult {
  source: string;
  id: number | string;
  title: string;
  snippet: string;
  url?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
