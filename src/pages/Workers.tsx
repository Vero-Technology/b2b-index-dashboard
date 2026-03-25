import { usePolling } from '../hooks/usePolling';
import { getWorkers } from '../api/scrapers';
import { Card } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { useToast } from '../components/ui/Toast';
import { POLL_INTERVALS } from '../lib/constants';
import type { Worker } from '../types/api';
import { Terminal, Skull } from 'lucide-react';
import client from '../api/client';

export default function Workers() {
  const { data: workers, isLoading, refetch } = usePolling(
    getWorkers,
    POLL_INTERVALS.WORKERS
  );
  const { toast } = useToast();

  async function handleKill(session: string) {
    const name = session.split('.')[1] || session;
    if (!window.confirm(`Kill worker "${name}"? This will terminate the process.`)) return;
    try {
      await client.post(`/api/scrapers/stop/${name}`);
      toast(`Killed worker ${name}`, 'success');
      refetch();
    } catch {
      toast(`Failed to kill worker ${name}`, 'error');
    }
  }

  const columns: Column<Worker>[] = [
    {
      key: 'session',
      header: 'Session',
      mono: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-gray-400" />
          <span>{row.session}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
            row.status === 'active'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-blue-50 text-blue-700'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              row.status === 'active' ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
          />
          {row.status === 'active' ? 'Detached' : 'Attached'}
        </span>
      ),
    },
    {
      key: 'raw',
      header: 'Details',
      mono: true,
      className: 'text-gray-400',
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          onClick={() => handleKill(row.session)}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50"
        >
          <Skull size={12} />
          Kill
        </button>
      ),
      className: 'w-20',
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Active Workers"
        action={
          <span className="font-mono text-xs text-gray-400">
            {workers?.length ?? 0} session{(workers?.length ?? 0) !== 1 ? 's' : ''}
          </span>
        }
      >
        <DataTable
          columns={columns}
          data={workers || []}
          isLoading={isLoading}
          emptyMessage="No active screen sessions"
        />
      </Card>
    </div>
  );
}
