import { ApiError, ApiErrorCode } from './types';

export const BASE_URL = 'https://k8s.mectest.ru/test-app';
export const TIMEOUT_MS = 15_000;

export type RequestOpts = Omit<RequestInit, 'signal'> & {
  token: string;
  retryOn401?: () => Promise<string>;
};

type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: { message?: string; code?: string };
};

export async function request<T>(path: string, opts: RequestOpts): Promise<T> {
  const { token, retryOn401, headers, ...init } = opts;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(headers ?? {}),
      },
    });
  } catch (e: unknown) {
    clearTimeout(timer);
    const err = e as { name?: string; message?: string };
    if (err?.name === 'AbortError') {
      throw new ApiError('TIMEOUT', 'Request timed out', undefined, true);
    }
    throw new ApiError('NETWORK', err?.message ?? 'Network error', undefined, true);
  }
  clearTimeout(timer);

  if (res.status === 401 && retryOn401) {
    const fresh = await retryOn401();
    return request<T>(path, { ...opts, token: fresh, retryOn401: undefined });
  }

  const json: ApiEnvelope<T> | null = await res.json().catch(() => null);

  if (!res.ok || !json?.ok) {
    const code = mapStatus(res.status);
    const msg = json?.error?.message ?? `HTTP ${res.status}`;
    const retryable = code === 'SERVER' || code === 'TIMEOUT';
    throw new ApiError(code, msg, res.status, retryable);
  }

  return json.data as T;
}

function mapStatus(s: number): ApiErrorCode {
  if (s === 401) return 'UNAUTHORIZED';
  if (s === 404) return 'NOT_FOUND';
  if (s === 400) return 'VALIDATION';
  if (s >= 500) return 'SERVER';
  return 'UNKNOWN';
}
