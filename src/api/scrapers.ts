import client from './client';
import type { ScraperStatus, ScraperGrouped, Worker, TableCount } from '../types/api';

export async function getScraperStatuses(): Promise<ScraperStatus[]> {
  const { data } = await client.get<{ scrapers: ScraperStatus[] }>('/api/scrapers/status');
  return data.scrapers;
}

export async function getScrapersGrouped(): Promise<ScraperGrouped[]> {
  const { data } = await client.get<{ datasets: ScraperGrouped[] }>('/api/scrapers/grouped');
  return data.datasets;
}

export async function getWorkers(): Promise<Worker[]> {
  const { data } = await client.get<{ workers: Worker[] }>('/api/scrapers/workers');
  return data.workers;
}

export async function getLogs(source: string, lines = 100): Promise<string[]> {
  const { data } = await client.get<{ lines: string[] }>(`/api/scrapers/logs/${source}`, {
    params: { lines },
  });
  return data.lines;
}

export async function getTableCounts(): Promise<TableCount> {
  const { data } = await client.get<{ tables: TableCount }>('/api/scrapers/tables');
  return data.tables;
}

export async function startScraper(source: string): Promise<{ status: string }> {
  const { data } = await client.post(`/api/scrapers/start/${source}`);
  return data;
}

export async function stopScraper(source: string): Promise<{ status: string }> {
  const { data } = await client.post(`/api/scrapers/stop/${source}`);
  return data;
}

export async function getNotes(source: string): Promise<string> {
  const { data } = await client.get<{ notes: string }>(`/api/scrapers/notes/${source}`);
  return data.notes;
}

export async function updateNotes(source: string, notes: string): Promise<void> {
  await client.put(`/api/scrapers/notes/${source}`, { notes });
}
