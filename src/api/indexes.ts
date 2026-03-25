import client from './client';
import type { IndexInfo, TableSize } from '../types/api';

export async function getIndexes(): Promise<IndexInfo[]> {
  const { data } = await client.get<{ indexes: IndexInfo[] }>('/api/indexes/list');
  return data.indexes;
}

export async function getTableSizes(): Promise<TableSize[]> {
  const { data } = await client.get<{ tables: TableSize[] }>('/api/indexes/table_sizes');
  return data.tables;
}

export async function getDiskUsage(): Promise<string[]> {
  const { data } = await client.get<{ disk: string[] }>('/api/indexes/disk');
  return data.disk;
}
