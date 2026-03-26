import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { getAdcomMembers } from '../../api/data';
import type { AdcomMember } from '../../types/api';

export default function AdComMembersPage() {
  const [data, setData] = useState<AdcomMember[]>([]);
  const [filtered, setFiltered] = useState<AdcomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [committee, setCommittee] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const members = await getAdcomMembers();
        setData(members);
        setFiltered(members);
      } catch {
        setData([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!committee) {
      setFiltered(data);
    } else {
      const lower = committee.toLowerCase();
      setFiltered(data.filter((m) => m.committee?.toLowerCase().includes(lower)));
    }
  }, [committee, data]);

  const columns: Column<AdcomMember>[] = [
    { key: 'full_name', header: 'Name' },
    { key: 'committee', header: 'Committee', mono: true },
    { key: 'role', header: 'Role' },
    { key: 'institution', header: 'Institution' },
    { key: 'specialty', header: 'Specialty' },
    { key: 'degree', header: 'Degree' },
    {
      key: 'is_current',
      header: 'Current',
      render: (row) => (
        <span className={row.is_current ? 'text-emerald-600 font-medium' : 'text-gray-300'}>
          {row.is_current ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/data" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-800 hover:text-gray-700">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-lg font-semibold text-gray-800">AdCom Members</h1>
      </div>

      <Card title="Filters">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input type="text" placeholder="Filter by committee..." value={committee}
            onChange={(e) => setCommittee(e.target.value)}
            className="rounded-lg border border-surface-700 bg-surface-950 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20" />
        </div>
      </Card>

      <Card title={`Members (${filtered.length})`} padding={false}>
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={loading}
          emptyMessage="No AdCom members found"
        />
      </Card>
    </div>
  );
}
