import client from './client';
import type { SystemOverview, PostgresStats, CapacityAssessment, DiskIO } from '../types/api';

export async function fetchSystemOverview(): Promise<SystemOverview> {
  const { data } = await client.get<SystemOverview>('/api/system/overview');
  return data;
}

export async function fetchPostgresStats(): Promise<PostgresStats> {
  const { data } = await client.get<PostgresStats>('/api/system/postgres');
  return data;
}

export async function fetchCapacity(): Promise<CapacityAssessment> {
  const { data } = await client.get<CapacityAssessment>('/api/system/capacity');
  return data;
}

export async function fetchDiskIO(): Promise<DiskIO> {
  const { data } = await client.get<DiskIO>('/api/system/io');
  return data;
}
