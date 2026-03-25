import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { DataTable, type Column } from '../components/ui/DataTable';
import { ProgressBar } from '../components/ui/ProgressBar';
import { getIndexes, getTableSizes, getDiskUsage } from '../api/indexes';
import type { IndexInfo, TableSize } from '../types/api';

export default function Indexes() {
  const [indexes, setIndexes] = useState<IndexInfo[]>([]);
  const [tables, setTables] = useState<TableSize[]>([]);
  const [disk, setDisk] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [idx, tbl, dsk] = await Promise.all([
          getIndexes(),
          getTableSizes(),
          getDiskUsage(),
        ]);
        setIndexes(idx);
        setTables(tbl);
        setDisk(dsk);
      } catch {
        // silently fail — empty state will show
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Parse disk usage line: e.g. "/dev/xvda1  50G   32G   18G  64% /data"
  const diskLine = disk[1] || '';
  const diskParts = diskLine.trim().split(/\s+/);
  const diskTotal = diskParts[1] || '—';
  const diskUsed = diskParts[2] || '—';
  const diskAvail = diskParts[3] || '—';
  const diskPercent = parseInt(diskParts[4] || '0');

  const indexColumns: Column<IndexInfo>[] = [
    { key: 'indexname', header: 'Index', mono: true },
    { key: 'tablename', header: 'Table', mono: true },
    { key: 'size', header: 'Size', mono: true },
  ];

  const tableColumns: Column<TableSize>[] = [
    { key: 'table_name', header: 'Table', mono: true },
    { key: 'data_size', header: 'Data Size', mono: true },
    { key: 'total_size', header: 'Total Size', mono: true },
    {
      key: 'row_count',
      header: 'Rows',
      mono: true,
      render: (row) => <span>{row.row_count?.toLocaleString() ?? '—'}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        Loading infrastructure data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Disk usage */}
      <Card title="Disk Usage">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-gray-100">{diskUsed}</span>
            <span className="text-sm text-gray-500">
              of {diskTotal} ({diskAvail} available)
            </span>
          </div>
          <ProgressBar value={diskPercent} />
          <div className="font-mono text-xs text-gray-600">{diskPercent}% used</div>
        </div>
      </Card>

      {/* Table sizes */}
      <Card title="Table Sizes" padding={false}>
        <DataTable
          columns={tableColumns}
          data={tables}
          emptyMessage="No tables found"
        />
      </Card>

      {/* Indexes */}
      <Card title="PostgreSQL Indexes" padding={false}>
        <DataTable
          columns={indexColumns}
          data={indexes}
          emptyMessage="No indexes found"
        />
      </Card>
    </div>
  );
}
