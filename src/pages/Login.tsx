import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowRight } from 'lucide-react';

export default function Login() {
  const [key, setKey] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    localStorage.setItem('scrape_api_key', key.trim());
    navigate('/', { replace: true });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-950 p-4">
      {/* Subtle background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm space-y-6 rounded-xl border border-surface-700/50 bg-surface-900 p-8"
      >
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <KeyRound size={24} />
          </div>
          <h1 className="font-display text-xl font-semibold text-gray-100">
            Alexandria
          </h1>
          <p className="text-sm text-gray-500">Scraping Dashboard</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="api-key" className="block text-xs font-medium text-gray-400">
            API Key
          </label>
          <input
            id="api-key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your API key"
            autoFocus
            className="w-full rounded-lg border border-surface-600 bg-surface-800 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
          />
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500"
        >
          Login
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
