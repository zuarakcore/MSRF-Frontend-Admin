/**
 * HTTP client for the MSRF FastAPI backend (`/api/v1`).
 *
 * Auth model (see backend app/modules/auth/router.py):
 * - `POST /auth/login` returns a short-lived access token in the body; we keep it in memory only.
 * - The refresh token is an httpOnly cookie scoped to /api/v1/auth. `POST /auth/refresh` trades it
 *   for a new access token. The Vite dev server proxies /api so the cookie is first-party.
 * - Any request that gets 401 refreshes once and is retried; if refresh fails the session ends.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/+$/, '');

export type FieldError = { field: string; message: string };

/** Error body: {"detail", "code", "errors"?: [{field, message}]} — backend app/core/errors.py. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: FieldError[];

  constructor(message: string, status: number, code: string, fieldErrors: FieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/** A readable message for any thrown value, for toasts and inline errors. */
export const errorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') =>
  error instanceof ApiError ? error.message : error instanceof Error ? error.message : fallback;

type Query = Record<string, string | number | boolean | null | undefined | (string | number)[]>;

interface RequestOptions {
  query?: Query;
  json?: unknown;
  form?: FormData;
  /** false for endpoints that must not carry or refresh the bearer token (login, refresh). */
  auth?: boolean;
  signal?: AbortSignal;
}

let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;
let onSessionExpired: (() => void) | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
  /** Called when a refresh fails, so the auth context can drop the user. */
  onExpired: (handler: (() => void) | null) => {
    onSessionExpired = handler;
  },
};

export function buildUrl(path: string, query?: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) value.forEach(v => params.append(key, String(v)));
    else params.set(key, String(value));
  }
  const qs = params.toString();
  return `${API_BASE}${path}${qs ? `?${qs}` : ''}`;
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = await response.json().catch(() => null);
  const fieldErrors: FieldError[] = Array.isArray(body?.errors) ? body.errors : [];
  let message: string;
  if (response.status === 429) message = 'Too many attempts. Please wait a moment and try again.';
  else if (body?.code === 'VALIDATION_ERROR' && fieldErrors.length)
    message = fieldErrors
      .map(e => `${e.field ? `${e.field}: ` : ''}${String(e.message).replace(/^Value error, /, '')}`)
      .join('; ');
  else message = body?.detail ?? `Request failed (${response.status})`;
  return new ApiError(message, response.status, body?.code ?? 'HTTP_ERROR', fieldErrors);
}

async function send(method: string, path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.auth !== false && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form; // the browser sets the multipart boundary
  else if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  }
  try {
    return await fetch(buildUrl(path, opts.query), {
      method,
      headers,
      body,
      credentials: 'same-origin',
      signal: opts.signal,
    });
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw error;
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0, 'NETWORK_ERROR');
  }
}

/** Exchange the refresh cookie for a new access token. Concurrent callers share one request. */
export function refreshAccessToken(): Promise<string | null> {
  refreshInFlight ??= (async () => {
    try {
      const response = await send('POST', '/auth/refresh', { auth: false });
      if (!response.ok) return null;
      const data = (await response.json()) as { accessToken: string };
      accessToken = data.accessToken;
      return accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function authorised(method: string, path: string, opts: RequestOptions): Promise<Response> {
  let response = await send(method, path, opts);
  if (response.status === 401 && opts.auth !== false) {
    const token = await refreshAccessToken();
    if (!token) {
      accessToken = null;
      onSessionExpired?.();
      throw await toApiError(response);
    }
    response = await send(method, path, opts);
  }
  return response;
}

export async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const response = await authorised(method, path, opts);
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json().catch(() => undefined)) as T;
}

export const http = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) => request<T>('GET', path, { query, signal }),
  post: <T>(path: string, json?: unknown, query?: Query) => request<T>('POST', path, { json, query }),
  put: <T>(path: string, json?: unknown) => request<T>('PUT', path, { json }),
  patch: <T>(path: string, json?: unknown) => request<T>('PATCH', path, { json }),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
  postForm: <T>(path: string, form: FormData, query?: Query) => request<T>('POST', path, { form, query }),
  patchForm: <T>(path: string, form: FormData) => request<T>('PATCH', path, { form }),
};

/** Fetch a file (CSV export, template) with auth and hand it to the browser as a download. */
export async function downloadFile(path: string, query?: Query, fallbackName = 'download.csv'): Promise<void> {
  const response = await authorised('GET', path, { query });
  if (!response.ok) throw await toApiError(response);
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  const fileName = match ? decodeURIComponent(match[1]) : fallbackName;
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
