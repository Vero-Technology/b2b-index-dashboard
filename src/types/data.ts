// Data browser types

export interface FDADrugApplication {
  application_number: string;
  brand_name: string | null;
  generic_name: string | null;
  sponsor_name: string | null;
  product_type: string | null;
  approval_date: string | null;
  fast_track: boolean;
  breakthrough_therapy: boolean;
  accelerated_approval: boolean;
  orphan_drug: boolean;
  documents_count: number;
  submissions_count: number;
}

export interface FDASubmission {
  submission_number: string;
  submission_type: string | null;
  submission_status: string | null;
  submission_status_date: string | null;
  review_priority: string | null;
}

export interface FDADocument {
  id: number;
  application_number: string | null;
  document_type: string | null;
  document_url: string | null;
  title: string | null;
  extracted_data: {
    efficacy_summary?: string;
    safety_summary?: string;
    clinical_trials?: string[];
    reviewer_concerns?: string[];
  } | null;
}

export interface FDAApplicationDetail {
  application: FDADrugApplication;
  submissions: FDASubmission[];
  documents: FDADocument[];
}

export interface AdcomDocument {
  id: number;
  committee: string | null;
  drug_name: string | null;
  meeting_date: string | null;
  document_type: string | null;
  vote_yes: number | null;
  vote_no: number | null;
  vote_abstain: number | null;
  vote_result: string | null;
  key_concerns: string | null;
  safety_signals: string | null;
  efficacy_data: string | null;
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
  has_more?: boolean;
}
