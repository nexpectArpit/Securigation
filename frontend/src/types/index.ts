export interface UnifiedSecurityEvent {
  event_id: string;
  investigation_id: string;
  timestamp: string;
  log_source: string;
  event_type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  source_ip?: string;
  destination_ip?: string;
  source_port?: number;
  destination_port?: number;
  user_account?: string;
  hostname?: string;
  summary: string;
  raw_log: string;
  metadata: Record<string, any>;
}

export interface ParitokMetricDetail {
  events: number;
  tokens: number;
  cost_usd: number;
  latency_sec: number;
}

export interface ParitokMetrics {
  without_paritok: ParitokMetricDetail;
  with_paritok: ParitokMetricDetail;
  compression_ratio: number;
  tokens_saved: number;
  cost_saved_usd: number;
  latency_saved_sec: number;
  status: "ACTIVE" | "API_DISCONNECTED";
  status_message: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "USER" | "HOST" | "IP" | "FILE" | "ACTION";
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface InvestigationSummaryData {
  attack_started: string;
  initial_access: string;
  compromised_user: string;
  persistence: string;
  outcome: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  associated_event_ids?: string[];
}

export interface QueryResponse {
  query_id: string;
  question: string;
  answer: string;
  evidence_used: string[];
  summary?: InvestigationSummaryData;
  graph: GraphData;
  timeline: TimelineEvent[];
  paritok_metrics: ParitokMetrics;
  supporting_evidence: UnifiedSecurityEvent[];
  created_at: string;
}

export interface UploadedFileInfo {
  file_id: string;
  filename: string;
  size_bytes: number;
  detected_format: string;
  event_count: number;
  status: string;
}

export interface InvestigationInfo {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  files: UploadedFileInfo[];
  total_events: number;
  is_demo: boolean;
}

export interface ReplayTraceStep {
  step: number;
  title: string;
  detail: string;
  timestamp: string;
}

export interface ReplayResponse {
  query_id: string;
  question: string;
  trace_steps: ReplayTraceStep[];
  metrics: ParitokMetrics;
}
