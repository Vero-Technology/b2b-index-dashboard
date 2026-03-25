export interface ScraperStatus {
  source: string;
  category: string;
  dataset: string | null;
  sub_category: string | null;
  data_source: string | null;
  total_expected: number;
  total_scraped: number;
  total_failed: number;
  status: string;
  started_at: string | null;
  updated_at: string | null;
  last_error: string | null;
  unique_contribution?: number | null;
}

export interface GroupTotals {
  scraped: number;
  expected: number;
  failed: number;
}

export interface SubCategory {
  sub_category: string;
  scrapers: ScraperStatus[];
  totals: GroupTotals;
  unique: number;
}

export interface ScraperGrouped {
  dataset: string;
  sub_categories: SubCategory[];
  totals: GroupTotals & { unique?: number };
}

export interface Worker {
  session: string;
  status: 'active' | 'attached';
  raw: string;
}

export interface TableCount {
  [table: string]: number | null;
}

export interface ConferenceAbstract {
  id: number;
  conference: string;
  year: number;
  abstract_number: string | null;
  title: string;
  first_authors: string[];
  disease_area: string | null;
  therapeutic_area: string | null;
  drugs_mentioned: string[] | null;
  biomarkers_mentioned: string[] | null;
  source_url: string | null;
}

export interface ConferenceStat {
  conference: string;
  year: number;
  count: number;
  with_disease: number;
  with_abstract: number;
}

export interface EmaEpar {
  id: number;
  product_name: string;
  active_substance: string | null;
  therapeutic_area: string | null;
  indication: string | null;
  marketing_auth_holder: string | null;
  document_type: string | null;
  benefit_risk_summary: string | null;
  source_url: string | null;
}

export interface AdcomMember {
  full_name: string;
  committee: string;
  role: string;
  institution: string | null;
  specialty: string | null;
  degree: string | null;
  is_current: boolean;
}

export interface IndexInfo {
  schemaname: string;
  tablename: string;
  indexname: string;
  size: string;
  size_bytes: number;
}

export interface TableSize {
  table_name: string;
  total_size: string;
  data_size: string;
  total_bytes: number;
  row_count: number;
}

// --- v2: System Metrics ---

export interface SystemOverview {
  disk: {
    total_gb: number;
    used_gb: number;
    free_gb: number;
    percent: number;
  };
  memory: {
    total_gb: number;
    used_gb: number;
    available_gb: number;
    percent: number;
    swap_used_gb: number;
    swap_total_gb: number;
  };
  cpu: {
    cores: number;
    per_core_percent: number[];
    avg_percent: number;
    load_1m: number;
    load_5m: number;
    load_15m: number;
  };
}

export interface PostgresStats {
  connections: {
    total: number;
    active: number;
    idle: number;
    idle_in_transaction: number;
  };
  cache_hit_ratio_percent: number;
  active_queries: {
    pid: number;
    state: string;
    duration_sec: number;
    query_preview: string;
    wait_event_type: string | null;
    wait_event: string | null;
  }[];
  vacuum_stats: {
    table: string;
    dead_tuples: number;
    last_vacuum: string | null;
    last_autovacuum: string | null;
  }[];
  wal_gb: number;
  shared_buffers: string;
  work_mem: string;
}

export interface CapacityAssessment {
  can_add_workers: boolean;
  recommendation: string;
  warnings: string[];
  headroom: {
    disk_free_gb: number;
    ram_available_gb: number;
    cpu_idle_percent: number;
    active_pg_queries: number;
  };
}

export interface DiskIO {
  read_gb: number;
  write_gb: number;
  read_count: number;
  write_count: number;
}

// --- v2: Worker Management ---

export interface WorkerSpec {
  description: string;
  category: string;
  args_schema: Record<string, {
    type: string;
    options?: string[];
    default?: string | number | boolean;
    min?: number;
    max?: number;
  }>;
  script_exists: boolean;
}

export interface ActiveWorker {
  worker_id: string;
  worker_type: string;
  pid: number;
  running: boolean;
  status: string;
  started_at: string;
  stopped_at: string | null;
  test_mode: boolean;
  args: Record<string, string | number | boolean>;
  log_tail: string;
}

export interface TestReport {
  filename: string;
  created: string;
  items_processed: number;
  items_with_errors: number;
  avg_time_per_item_sec: number;
  estimated_total_time_min: number;
  sample_output: unknown[];
  errors: string[];
}
