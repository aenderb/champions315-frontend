import { get, postFormData, putFormData, del } from "./client";
import type { ApiPlayer, ApiPlayerCreate, ApiPlayerUpdate } from "../types/api";

/** Monta FormData a partir dos dados do jogador (snake_case para o backend) */
function buildPlayerFormData(data: ApiPlayerCreate | ApiPlayerUpdate): FormData {
  const fd = new FormData();
  if (data.number !== undefined) fd.append("number", String(data.number));
  if (data.name !== undefined) fd.append("name", data.name);
  if (data.birthDate !== undefined) fd.append("birth_date", data.birthDate);
  if (data.position !== undefined) fd.append("position", data.position);
  if (data.fieldRole !== undefined) fd.append("field_role", data.fieldRole);
  if (data.avatar instanceof File) fd.append("avatar", data.avatar);
  return fd;
}

/** Cria um jogador no time (multipart/form-data) */
export async function createPlayer(teamId: string, data: ApiPlayerCreate): Promise<ApiPlayer> {
  const fd = buildPlayerFormData(data);
  return postFormData<ApiPlayer>(`/teams/${teamId}/players`, fd);
}

/** Lista jogadores do time */
export async function getPlayers(teamId: string): Promise<ApiPlayer[]> {
  return get<ApiPlayer[]>(`/teams/${teamId}/players`);
}

/** Busca um jogador por ID */
export async function getPlayerById(teamId: string, id: string): Promise<ApiPlayer> {
  return get<ApiPlayer>(`/teams/${teamId}/players/${id}`);
}

/** Atualiza um jogador (multipart/form-data) */
export async function updatePlayer(teamId: string, id: string, data: ApiPlayerUpdate): Promise<ApiPlayer> {
  const fd = buildPlayerFormData(data);
  return putFormData<ApiPlayer>(`/teams/${teamId}/players/${id}`, fd);
}

/** Exclui um jogador */
export async function deletePlayer(teamId: string, id: string): Promise<void> {
  return del(`/teams/${teamId}/players/${id}`);
}

