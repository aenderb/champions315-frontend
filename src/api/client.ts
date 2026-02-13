/**
 * API client simulado.
 * Quando o backend existir, basta trocar a implementação aqui
 * por chamadas reais com fetch/axios.
 */

const SIMULATED_DELAY_MS = 600;

/**
 * Simula uma chamada de rede com delay e retorna os dados mock.
 * No futuro, substituir por: fetch(`${BASE_URL}/${endpoint}`)
 */
export async function apiClient<T>(
  _endpoint: string,
  mockData: T
): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData), SIMULATED_DELAY_MS);
  });
}

/**
 * Quando o backend estiver pronto, usar algo assim:
 *
 * const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
 *
 * export async function apiClient<T>(endpoint: string): Promise<T> {
 *   const res = await fetch(`${BASE_URL}/${endpoint}`);
 *   if (!res.ok) throw new Error(`API error: ${res.status}`);
 *   const json: ApiResponse<T> = await res.json();
 *   if (!json.success) throw new Error(json.message || "Erro desconhecido");
 *   return json.data;
 * }
 */
