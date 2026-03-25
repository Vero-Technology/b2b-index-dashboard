import { useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/system': 'System Monitor',
  '/launch': 'Launch Workers',
  '/workers': 'Workers',
  '/data': 'Data Browser',
  '/indexes': 'Indexes & Storage',
};

interface HeaderProps {
  onRefresh?: () => void;
}

export function Header({ onRefresh }: HeaderProps) {
  const location = useLocation();

  const title =
    PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/scrapers/') ? 'Scraper Detail' : 'Dashboard');

  return (
    <header className="flex h-14 items-center justify-between border-b border-surface-700/50 px-6">
      <h1 className="font-display text-lg font-semibold text-gray-100">{title}</h1>
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-surface-700 hover:text-gray-200"
          >
            <RefreshCw size={15} />
          </button>
        )}
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] text-gray-500">API Connected</span>
        </div>
      </div>
    </header>
  );
}
