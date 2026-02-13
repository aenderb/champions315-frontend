/**
 * HTTP client para comunicação com o backend Champions 315.
 * Usa fetch nativo com credentials: "include" para cookies httpOnly.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

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
  constructor(public status: number, message: string) {
    super(message);
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

export async function get<T>(endpoint: string, opts?: RequestOptions): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
  });
  return handleResponse<T>(res, opts);
}

export async function post<T>(
  endpoint: string,
  body?: unknown,
  opts?: RequestOptions
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
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
  const res = await fetch(`${BASE_URL}${endpoint}`, {
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
  const res = await fetch(`${BASE_URL}${endpoint}`, {
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
  const res = await fetch(`${BASE_URL}${endpoint}`, {
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
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });
  return handleResponse<T>(res, opts);
}

export async function del<T = void>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse<T>(res);
}

