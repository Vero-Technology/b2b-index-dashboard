import client from './client';
import type { WorkerSpec, ActiveWorker, TestReport } from '../types/api';

export async function fetchWorkerRegistry(): Promise<Record<string, WorkerSpec>> {
  const { data } = await client.get<{ workers: Record<string, WorkerSpec> }>('/api/workers/registry');
  return data.workers;
}

export async function fetchActiveWorkers(): Promise<ActiveWorker[]> {
  const { data } = await client.get<{ workers: ActiveWorker[] }>('/api/workers/active');
  return data.workers;
}

export async function launchWorker(params: {
  worker_type: string;
  args?: Record<string, string | number | boolean>;
  test_mode?: boolean;
  test_sample_size?: number;
}): Promise<{ worker_id: string; status: string }> {
  const { data } = await client.post('/api/workers/launch', params);
  return data;
}

export async function stopWorker(workerId: string): Promise<{ status: string }> {
  const { data } = await client.post(`/api/workers/stop/${workerId}`);
  return data;
}

export async function fetchWorkerLogs(
  workerId: string,
  tail = 100
): Promise<{ lines: string[]; total_lines: number }> {
  const { data } = await client.get(`/api/workers/logs/${workerId}`, {
    params: { tail },
  });
  return data;
}

export async function clearWorker(workerId: string): Promise<{ status: string }> {
  const { data } = await client.delete(`/api/workers/clear/${workerId}`);
  return data;
}

export async function fetchTestReports(): Promise<TestReport[]> {
  const { data } = await client.get<{ reports: TestReport[] }>('/api/workers/test-reports');
  return data.reports;
}

export async function fetchTestReport(filename: string): Promise<TestReport> {
  const { data } = await client.get<TestReport>(`/api/workers/test-reports/${filename}`);
  return data;
}
