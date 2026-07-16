// API base lives in ../lib/api as a plain string literal ('/api') so the
// platform can rewrite it to the deployed backend URL. Every request is built
// as `${BASE}/v1${path}` → e.g. "/api/v1/courses" (one /api).
import BASE from '../lib/api';

const ADMIN_TOKEN_KEY = 'fs_admin_token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach the admin bearer token
};

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.auth) {
    const token = getAdminToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}/v1${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* empty / non-JSON body */
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return data as T;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
