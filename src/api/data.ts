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

export async function getAdcomDocuments(params: {
  committee?: string;
  drug?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<AdcomDocument>> {
  const { data } = await client.get('/api/data/fda_adcom_documents', { params });
  return data;
}
