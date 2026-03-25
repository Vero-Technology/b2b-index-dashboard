import client from './client';
import type { ConferenceAbstract, ConferenceStat, EmaEpar, AdcomMember } from '../types/api';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
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

export async function getConferenceStats(): Promise<ConferenceStat[]> {
  const { data } = await client.get<{ stats: ConferenceStat[] }>('/api/data/conference_abstracts/stats');
  return data.stats;
}

export async function getEmaEpars(params: {
  therapeutic_area?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<EmaEpar>> {
  const { data } = await client.get('/api/data/ema_epars', { params });
  return data;
}

export async function getAdcomMembers(): Promise<AdcomMember[]> {
  const { data } = await client.get<{ data: AdcomMember[] }>('/api/data/adcom_members');
  return data.data;
}
