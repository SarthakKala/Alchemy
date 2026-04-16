import axios, { AxiosError } from 'axios';
import type { MetricsStore, QueryResponse, SavedQuery, UploadResponse } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const api = axios.create({ baseURL: BASE_URL });

/** Turn Axios / FastAPI errors into a single message for the UI. */
export function formatApiError(err: unknown): string {
  const axiosErr = err as AxiosError<{ detail?: unknown }>;
  if (!axiosErr.response) {
    const code = (axiosErr as AxiosError & { code?: string }).code;
    const msg = (axiosErr.message || '').toLowerCase();
    const isUnreachable =
      code === 'ERR_NETWORK' ||
      code === 'ECONNREFUSED' ||
      msg.includes('network error') ||
      msg.includes('connection refused') ||
      msg.includes('failed to fetch');
    if (isUnreachable) {
      return `Cannot reach API at ${BASE_URL}. Start the backend: cd backend → activate venv → uvicorn app.main:app --reload --host 127.0.0.1 --port 8000. Then open http://127.0.0.1:8000/health to confirm. If you changed .env.local, restart npm run dev.`;
    }
    return axiosErr.message || 'Network error';
  }
  const detail = axiosErr.response.data?.detail;
  if (typeof detail === 'string') return detail;
  if (detail && typeof detail === 'object') {
    const d = detail as { message?: string };
    if (typeof d.message === 'string') return d.message;
    try {
      return JSON.stringify(detail);
    } catch {
      return `HTTP ${axiosErr.response.status}`;
    }
  }
  return `HTTP ${axiosErr.response.status}`;
}

export async function uploadCSV(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<UploadResponse>('/api/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) {
    throw new Error(formatApiError(err));
  }
}

export class RateLimitError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super('Rate limited');
    this.retryAfter = retryAfter;
  }
}

export async function runQuery(
  sessionId: string,
  tableName: string,
  userQuery: string,
  clarificationResolved = false,
  resolvedQuery?: string
): Promise<QueryResponse> {
  try {
    const { data } = await api.post<QueryResponse>('/api/query/', {
      session_id: sessionId,
      table_name: tableName,
      user_query: userQuery,
      clarification_resolved: clarificationResolved,
      resolved_query: resolvedQuery,
    });
    return data;
  } catch (err) {
    const axiosErr = err as AxiosError<{
      detail: { message?: string; retry_after?: number } | string;
    }>;
    if (axiosErr.response?.status === 429) {
      const d = axiosErr.response.data?.detail;
      const retryAfter =
        typeof d === 'object' && d && 'retry_after' in d
          ? (d.retry_after ?? 10)
          : 10;
      throw new RateLimitError(retryAfter);
    }
    throw new Error(formatApiError(err));
  }
}

export async function getMetrics(): Promise<MetricsStore> {
  const { data } = await api.get<MetricsStore>('/api/metrics/');
  return data;
}

export async function saveMetrics(metrics: MetricsStore): Promise<void> {
  await api.put('/api/metrics/', metrics);
}

export async function saveQuery(
  sessionId: string,
  name: string,
  queryText: string,
  intent?: string
): Promise<SavedQuery> {
  const { data } = await api.post<SavedQuery>('/api/library/', {
    session_id: sessionId,
    name,
    query_text: queryText,
    intent,
  });
  return data;
}

export async function getLibrary(sessionId: string): Promise<SavedQuery[]> {
  const { data } = await api.get<SavedQuery[]>('/api/library/', {
    params: { session_id: sessionId },
  });
  return data;
}

export async function deleteSavedQuery(sessionId: string, queryId: string): Promise<void> {
  await api.delete(`/api/library/${queryId}`, {
    params: { session_id: sessionId },
  });
}

export async function replaySavedQuery(sessionId: string, queryId: string): Promise<SavedQuery> {
  const { data } = await api.post<SavedQuery>(`/api/library/${queryId}/replay`, null, {
    params: { session_id: sessionId },
  });
  return data;
}
