import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AlexandriaLogo } from '../components/layout/AlexandriaLogo';

export default function Login() {
  const [key, setKey] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    localStorage.setItem('scrape_api_key', key.trim());
    navigate('/', { replace: true });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-950 p-4">
      {/* Subtle decorative lines */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-64 w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-surface-700 to-transparent" />
        <div className="absolute top-1/2 -left-32 h-[1px] w-64 -translate-y-1/2 bg-gradient-to-r from-transparent via-surface-700 to-transparent" />
        <div className="absolute top-1/2 -right-32 h-[1px] w-64 -translate-y-1/2 bg-gradient-to-l from-transparent via-surface-700 to-transparent" />
        <div className="absolute -bottom-32 left-1/2 h-64 w-[1px] -translate-x-1/2 bg-gradient-to-t from-transparent via-surface-700 to-transparent" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md space-y-8 rounded-2xl border border-surface-700 bg-white px-10 py-12 shadow-lg"
      >
        {/* Corner accents */}
        <div className="absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-accent/20 rounded-tl-sm" />
        <div className="absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-accent/20 rounded-tr-sm" />
        <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-accent/20 rounded-bl-sm" />
        <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-accent/20 rounded-br-sm" />

        {/* Logo + subtitle */}
        <div className="space-y-3 text-center">
          <AlexandriaLogo className="mx-auto h-8 w-auto" />
          <div className="h-[1px] mx-auto w-16 bg-surface-700" />
          <p className="font-display text-sm tracking-wide text-gray-400">
            Scraping Dashboard
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label htmlFor="api-key" className="block text-xs font-medium uppercase tracking-wider text-gray-400">
            API Key
          </label>
          <div
            className={`overflow-hidden rounded-lg border transition-all duration-200 ${
              focused
                ? 'border-accent shadow-[0_0_0_3px_rgba(5,56,39,0.08)]'
                : 'border-surface-700'
            }`}
          >
            <input
              id="api-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Enter your API key"
              autoFocus
              className="w-full bg-surface-950 px-4 py-3 text-sm text-gray-900 placeholder-gray-300 outline-none"
            />
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-all hover:bg-accent/90 hover:shadow-md"
        >
          Continue
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </button>

        <p className="text-center text-[11px] text-gray-300">
          Secure connection to Alexandria infrastructure
        </p>
      </form>
    </div>
  );
}
