export interface Column {
  name: string;
  type: string;
  sample: (string | number | boolean)[];
  null_count: number;
}

export interface SchemaInfo {
  date_columns: string[];
  numeric_columns: string[];
  categorical_columns: string[];
  text_columns: string[];
}

export interface UploadResponse {
  session_id: string;
  table_name: string;
  filename: string;
  row_count: number;
  columns: Column[];
  schema_info: SchemaInfo;
  starter_questions: string[];
}

export interface QueryResponse {
  session_id?: string;
  user_query?: string;
  intent?: string;
  is_ambiguous?: boolean;
  clarification_question?: string;
  generated_sql?: string;
  is_sql_valid?: boolean;
  raw_results?: Record<string, unknown>[];
  row_count?: number;
  columns_used?: string[];
  answer_text?: string;
  chart_type?: 'bar' | 'line' | 'pie' | 'stat';
  chart_data?: Record<string, unknown>[];
  confidence?: 'high' | 'medium' | 'low';
  confidence_reason?: string;
  error?: string;
}

export interface HistoryItem {
  id: string;
  query: string;
  answer: string;
  timestamp: Date;
  confidence: 'high' | 'medium' | 'low';
}

export interface MetricDefinition {
  definition: string;
  maps_to: string[];
  unit: string;
}

export type MetricsStore = Record<string, MetricDefinition>;
