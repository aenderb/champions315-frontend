import { get, post, put, del } from "./client";
import type { ApiLineup, ApiLineupCreate, ApiLineupUpdate } from "../types/api";

/** Cria uma escalação para o time */
export async function createLineup(teamId: string, data: ApiLineupCreate): Promise<ApiLineup> {
  return post<ApiLineup>(`/teams/${teamId}/lineups`, data);
}

/** Lista escalações do time */
export async function getLineups(teamId: string): Promise<ApiLineup[]> {
  return get<ApiLineup[]>(`/teams/${teamId}/lineups`);
}

/** Busca uma escalação por ID */
export async function getLineupById(teamId: string, id: string): Promise<ApiLineup> {
  return get<ApiLineup>(`/teams/${teamId}/lineups/${id}`);
}

/** Atualiza uma escalação */
export async function updateLineup(teamId: string, id: string, data: ApiLineupUpdate): Promise<ApiLineup> {
  return put<ApiLineup>(`/teams/${teamId}/lineups/${id}`, data);
}

/** Exclui uma escalação */
export async function deleteLineup(teamId: string, id: string): Promise<void> {
  return del(`/teams/${teamId}/lineups/${id}`);
}
