import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="flex h-dvh bg-surface-950 text-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="relative flex-1 overflow-y-auto p-6">
          {/* Subtle dot grid background */}
          <div
            className="pointer-events-none fixed inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
