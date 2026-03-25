import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'lucide-react';

interface LogViewerProps {
  lines: string[];
  isLive?: boolean;
  maxHeight?: string;
}

export function LogViewer({ lines, isLive = false, maxHeight = '28rem' }: LogViewerProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lines, autoScroll]);

  function getLineColor(line: string): string {
    if (line.includes('ERROR') || line.includes('error') || line.includes('Traceback'))
      return 'text-red-400';
    if (line.includes('WARNING') || line.includes('warn'))
      return 'text-yellow-400';
    if (line.includes('SUCCESS') || line.includes('success') || line.includes('completed'))
      return 'text-emerald-400';
    return 'text-green-400/80';
  }

  return (
    <div className="overflow-hidden rounded-lg border border-surface-700/50 bg-surface-950">
      <div className="flex items-center justify-between border-b border-surface-700/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-gray-500" />
          <span className="font-mono text-xs text-gray-400">
            {isLive ? 'Live Logs' : 'Logs'}
          </span>
          {isLive && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[10px] text-emerald-400/70">LIVE</span>
            </span>
          )}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="h-3 w-3 rounded border-surface-600 bg-surface-800 accent-amber-500"
          />
          Auto-scroll
        </label>
      </div>
      <div
        ref={containerRef}
        className="overflow-y-auto p-4 font-mono text-xs leading-relaxed"
        style={{ maxHeight }}
      >
        {lines.length === 0 ? (
          <div className="text-gray-600 italic">No log output yet...</div>
        ) : (
          lines.map((line, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap break-all py-px hover:bg-surface-800/40 ${getLineColor(line)}`}
            >
              {line}
            </div>
          ))
        )}
        {isLive && (
          <div className="mt-1 flex items-center gap-1">
            <span className="inline-block h-3.5 w-1.5 animate-pulse bg-green-400/70" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
