import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowRight } from 'lucide-react';
import { AlexandriaLogo } from '../components/layout/AlexandriaLogo';

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
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm space-y-6 rounded-xl border border-surface-700 bg-white p-8 shadow-sm"
      >
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light text-accent">
            <KeyRound size={24} />
          </div>
          <AlexandriaLogo className="mx-auto h-5 w-auto" />
          <p className="text-sm text-gray-400">Scraping Dashboard</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="api-key" className="block text-xs font-medium text-gray-500">
            API Key
          </label>
          <input
            id="api-key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your API key"
            autoFocus
            className="w-full rounded-lg border border-surface-700 bg-surface-950 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          Login
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
