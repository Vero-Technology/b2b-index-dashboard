import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Rocket,
  Terminal,
  Database,
  HardDrive,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/system', icon: Cpu, label: 'System Monitor' },
  { to: '/launch', icon: Rocket, label: 'Launch Workers' },
  { to: '/workers', icon: Terminal, label: 'Workers' },
  { to: '/data', icon: Database, label: 'Data Browser' },
  { to: '/indexes', icon: HardDrive, label: 'Indexes' },
];

export function Sidebar() {
  function handleLogout() {
    localStorage.removeItem('scrape_api_key');
    window.location.href = '/login';
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-surface-700/50 bg-surface-950">
      {/* Brand */}
      <div className="px-5 py-5">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
          Alexandria
        </div>
        <div className="mt-0.5 text-[10px] text-gray-600">Scrape Dashboard</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-amber-500/10 text-amber-400 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.15)]'
                  : 'text-gray-400 hover:bg-surface-800 hover:text-gray-200'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-surface-700/50 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-surface-800 hover:text-gray-300"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
