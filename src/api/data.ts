import client from './client';
import type { ConferenceAbstract, EmaEpar, AdcomMember } from '../types/api';
import type {
  FDADrugApplication,
  FDAApplicationDetail,
  FDADocument,
  FDADocumentStats,
  AdcomDocument,
  SourceStatus,
  SourceQuality,
  PaginatedResponse,
} from '../types/data';

export type { PaginatedResponse };

export async function getSourcesStatus(): Promise<SourceStatus[]> {
  const { data } = await client.get('/api/data/sources/status');
  return data.data || data;
}

export async function getSourceQuality(source: string): Promise<SourceQuality> {
  const { data } = await client.get(`/api/data/sources/${source}/quality`);
  return data;
}

export async function getConferenceAbstracts(params: {
  conference?: string;
  year?: number;
  disease?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<ConferenceAbstract>> {
  const { data } = await client.get('/api/data/conference_abstracts', { params });
  return data;
}

export async function getEmaEpars(params: {
  therapeutic_area?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<EmaEpar>> {
  const { data } = await client.get('/api/data/ema_epars', { params });
  return data;
}

export async function getAdcomMembers(params?: {
  committee?: string;
}): Promise<AdcomMember[]> {
  const { data } = await client.get<{ data: AdcomMember[] }>('/api/data/adcom_members', { params });
  return data.data;
}

export async function getFDADrugApplications(params: {
  search?: string;
  product_type?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<FDADrugApplication>> {
  const { data } = await client.get('/api/data/fda_drug_applications', { params });
  return data;
}

export async function getFDAApplicationDetail(appNumber: string): Promise<FDAApplicationDetail> {
  const { data } = await client.get(`/api/data/fda_drug_applications/${appNumber}`);
  return data;
}

export async function getFDADrugDocuments(params: {
  doc_type?: string;
  extracted_only?: boolean;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<FDADocument>> {
  const { data } = await client.get('/api/data/fda_drug_documents', { params });
  return data;
}

export async function getFDADocumentStats(): Promise<FDADocumentStats> {
  const { data } = await client.get('/api/data/fda_drug_documents/stats');
  return data;
}

export async function getClinicalTrials(params: {
  phase?: string;
  status?: string;
  study_type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<Record<string, unknown>>> {
  const { data } = await client.get('/api/data/clinical_trials', { params });
  return data;
}

export async function getClinicalTrialsFilters(): Promise<{
  phases: string[];
  statuses: string[];
  study_types: string[];
}> {
  const { data } = await client.get('/api/data/clinical_trials/filters');
  return data;
}

export async function getAdcomDocuments(params: {
  committee?: string;
  drug?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<AdcomDocument>> {
  const { data } = await client.get('/api/data/fda_adcom_documents', { params });
  return data;
}

export interface SECFiling {
  id: number;
  company: string;
  form_type: string;
  filing_date: string | null;
  source_url: string;
  crl_count: number;
  pipeline_count: number;
  patent_count: number;
  litigation_count?: number;
  crls?: Record<string, unknown>[];
  pipeline_drugs?: Record<string, unknown>[];
  patent_expirations?: Record<string, unknown>[];
  litigation?: Record<string, unknown>[];
}

export interface FDACRL {
  id: number;
  drug_name: string;
  generic_name: string | null;
  sponsor: string;
  indication: string;
  application_type: string;
  crl_date: string | null;
  rejection_reasons: string[];
  fda_requests: string[];
  source_type: string;
  filing_date: string | null;
  source_url: string;
}

export interface EMARefusal {
  id: number;
  product_name: string;
  active_substance: string | null;
  therapeutic_area: string | null;
  outcome_type: string;
  reason: string | null;
  decision_date: string | null;
  epar_url: string | null;
}

export async function getSECFilings(params: {
  company?: string;
  form_type?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<SECFiling>> {
  const { data } = await client.get('/api/data/sec_filings', { params });
  return data;
}

export async function getFDACRLs(params: {
  drug_name?: string;
  sponsor?: string;
  indication?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<FDACRL>> {
  const { data } = await client.get('/api/data/fda_crls', { params });
  return data;
}

export async function getEMARefusals(params: {
  product_name?: string;
  outcome_type?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<EMARefusal>> {
  const { data } = await client.get('/api/data/ema_refusals', { params });
  return data;
}
