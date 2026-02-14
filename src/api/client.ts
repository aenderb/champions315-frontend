/**
 * HTTP client para comunicação com o backend Champions 315.
 * Usa fetch nativo com credentials: "include" para cookies httpOnly.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

// ── Auto-refresh em 401 ────────────────────────

let _refreshPromise: Promise<void> | null = null;

/**
 * Tenta renovar o access token via refresh_token cookie.
 * Dedup: se já houver um refresh em andamento, reutiliza a mesma promise.
 */
export async function tryRefresh(): Promise<boolean> {
  try {
    if (!_refreshPromise) {
      _refreshPromise = fetch(`${BASE_URL}/users/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }).then((res) => {
        if (!res.ok) throw new Error("refresh failed");
      });
    }
    await _refreshPromise;
    return true;
  } catch {
    return false;
  } finally {
    _refreshPromise = null;
  }
}

/** Evento global disparado quando a sessão expira (401 + refresh falha) */
export function onAuthExpired(cb: () => void): () => void {
  window.addEventListener("auth:expired", cb);
  return () => window.removeEventListener("auth:expired", cb);
}

function emitAuthExpired() {
  window.dispatchEvent(new Event("auth:expired"));
}

// ── snake_case ↔ camelCase helpers ──────────────

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/** Converte recursivamente chaves de snake_case para camelCase */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function keysToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(keysToCamel);
  if (obj !== null && typeof obj === "object" && !(obj instanceof File)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [snakeToCamel(k), keysToCamel(v)])
    );
  }
  return obj;
}

/** Converte recursivamente chaves de camelCase para snake_case */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function keysToSnake(obj: any): any {
  if (Array.isArray(obj)) return obj.map(keysToSnake);
  if (obj !== null && typeof obj === "object" && !(obj instanceof File)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [camelToSnake(k), keysToSnake(v)])
    );
  }
  return obj;
}

// ── Erro customizado da API ─────────────────────

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// ── Métodos HTTP ────────────────────────────────

interface RequestOptions {
  /** Não converter chaves da resposta (ex: quando response é vazia) */
  raw?: boolean;
}

async function handleResponse<T>(res: Response, opts?: RequestOptions): Promise<T> {
  if (res.status === 204) return undefined as T;

  const text = await res.text().catch(() => null);
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // resposta não é JSON
  }

  if (!res.ok) {
    const msg = json?.message || json?.error || text || `Erro ${res.status}`;
    console.error(`[API] ${res.status} ${res.statusText}`, { url: res.url, body: json ?? text });
    throw new ApiError(res.status, typeof msg === "string" ? msg : `Erro ${res.status}`);
  }

  return opts?.raw ? json : keysToCamel(json);
}

/**
 * Wrapper de fetch que tenta refresh automático em caso de 401.
 * Se o refresh também falhar, emite auth:expired para forçar re-login.
 */
async function fetchWithAuth(
  url: string,
  init: RequestInit,
  skipRetry = false
): Promise<Response> {
  const res = await fetch(url, init);

  if (res.status === 401 && !skipRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      // Retry com o cookie renovado
      return fetch(url, init);
    }
    // Refresh falhou — sessão expirou
    emitAuthExpired();
  }

  return res;
}

export async function get<T>(endpoint: string, opts?: RequestOptions): Promise<T> {
  const res = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
    credentials: "include",
  });
  return handleResponse<T>(res, opts);
}

export async function post<T>(
  endpoint: string,
  body?: unknown,
  opts?: RequestOptions
): Promise<T> {
  const res = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(keysToSnake(body)) : undefined,
  });
  return handleResponse<T>(res, opts);
}

export async function postFormData<T>(
  endpoint: string,
  formData: FormData,
  opts?: RequestOptions
): Promise<T> {
  const res = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return handleResponse<T>(res, opts);
}

export async function put<T>(
  endpoint: string,
  body?: unknown,
  opts?: RequestOptions
): Promise<T> {
  const res = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(keysToSnake(body)) : undefined,
  });
  return handleResponse<T>(res, opts);
}

export async function putFormData<T>(
  endpoint: string,
  formData: FormData,
  opts?: RequestOptions
): Promise<T> {
  const res = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  return handleResponse<T>(res, opts);
}

export async function patchFormData<T>(
  endpoint: string,
  formData: FormData,
  opts?: RequestOptions
): Promise<T> {
  const res = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });
  return handleResponse<T>(res, opts);
}

export async function del<T = void>(endpoint: string): Promise<T> {
  const res = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse<T>(res);
}

