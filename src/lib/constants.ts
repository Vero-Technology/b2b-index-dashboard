export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  SCRAPER_DETAIL: '/scrapers/:source',
  WORKERS: '/workers',
  DATA: '/data',
  INDEXES: '/indexes',
} as const;

export const POLL_INTERVALS = {
  DASHBOARD: 15_000,
  LOGS: 5_000,
  WORKERS: 10_000,
} as const;

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  running: { label: 'Running', bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  completed: { label: 'Completed', bg: 'bg-green-500/15', text: 'text-green-400', dot: 'bg-green-400' },
  failed: { label: 'Failed', bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  pending: { label: 'Pending', bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  idle: { label: 'Idle', bg: 'bg-gray-500/15', text: 'text-gray-400', dot: 'bg-gray-500' },
} as const;

export const SCRAPER_DISPLAY_NAMES: Record<string, string> = {
  crossref: 'CrossRef Conferences',
  conference: 'Conference Abstracts',
  ema_epars: 'EMA EPARs',
  fda_adcom: 'FDA AdCom Documents',
  adcom_members: 'AdCom Members',
  llm_extract: 'LLM Extraction',
  dedup: 'Deduplication',
};
