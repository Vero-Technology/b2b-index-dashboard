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
  running: { label: 'Running', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  completed: { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  failed: { label: 'Failed', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  idle: { label: 'Idle', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
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
