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
import { AlexandriaLogo } from './AlexandriaLogo';

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
    <aside className="flex h-full w-60 flex-col border-r border-surface-700 bg-white">
      {/* Brand */}
      <div className="px-5 py-5">
        <AlexandriaLogo className="h-6 w-auto" />
        <div className="mt-1 text-[10px] font-medium tracking-wide text-gray-400">
          Scrape Dashboard
        </div>
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
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent-light text-accent shadow-sm'
                  : 'text-gray-500 hover:bg-surface-800 hover:text-gray-800'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-surface-700 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-surface-800 hover:text-gray-700"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
