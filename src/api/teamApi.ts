import { get, postFormData, putFormData, del } from "./client";
import type { ApiTeam, ApiTeamCreate, ApiTeamUpdate } from "../types/api";

/** Monta FormData a partir dos dados do time (snake_case para o backend) */
function buildTeamFormData(data: ApiTeamCreate | ApiTeamUpdate): FormData {
  const fd = new FormData();
  if (data.name !== undefined) fd.append("name", data.name);
  if (data.color !== undefined) fd.append("color", data.color);
  if (data.year !== undefined && data.year !== null) fd.append("year", String(data.year));
  if (data.sponsor !== undefined && data.sponsor !== null) fd.append("sponsor", data.sponsor);
  if (data.badge instanceof File) fd.append("badge", data.badge);
  if (data.sponsorLogo instanceof File) fd.append("sponsor_logo", data.sponsorLogo);
  return fd;
}

/** Cria um novo time (multipart/form-data) */
export async function createTeam(data: ApiTeamCreate): Promise<ApiTeam> {
  const fd = buildTeamFormData(data);
  return postFormData<ApiTeam>("/teams", fd);
}

/** Lista todos os times do usuário autenticado */
export async function getTeams(): Promise<ApiTeam[]> {
  return get<ApiTeam[]>("/teams");
}

/** Busca um time por ID */
export async function getTeamById(id: string): Promise<ApiTeam> {
  return get<ApiTeam>(`/teams/${id}`);
}

/** Atualiza um time (multipart/form-data) */
export async function updateTeam(id: string, data: ApiTeamUpdate): Promise<ApiTeam> {
  const fd = buildTeamFormData(data);
  return putFormData<ApiTeam>(`/teams/${id}`, fd);
}

/** Exclui um time e todos os seus jogadores e escalações */
export async function deleteTeam(id: string): Promise<void> {
  return del(`/teams/${id}`);
}
