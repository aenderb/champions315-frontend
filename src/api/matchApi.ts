import { get, post, del } from "./client";
import type { ApiMatch, ApiMatchCreate } from "../types/api";

const base = (teamId: string) => `/teams/${teamId}/matches`;

export async function getMatches(teamId: string): Promise<ApiMatch[]> {
  return get<ApiMatch[]>(base(teamId));
}

export async function getMatchById(
  teamId: string,
  matchId: string
): Promise<ApiMatch> {
  return get<ApiMatch>(`${base(teamId)}/${matchId}`);
}

export async function createMatch(
  teamId: string,
  data: ApiMatchCreate
): Promise<ApiMatch> {
  return post<ApiMatch>(base(teamId), data);
}

export async function deleteMatch(
  teamId: string,
  matchId: string
): Promise<void> {
  return del(`${base(teamId)}/${matchId}`);
}

