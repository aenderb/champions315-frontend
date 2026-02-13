import { apiClient } from "./client";
import { mockPlayers } from "../mocks";
import type { ApiPlayer } from "../types/api";

/** Busca todos os jogadores do time */
export async function getPlayers(): Promise<ApiPlayer[]> {
  return apiClient("/players", mockPlayers);
}

/** Busca um jogador por ID */
export async function getPlayerById(
  playerId: string
): Promise<ApiPlayer | undefined> {
  const player = mockPlayers.find((p) => p.id === playerId);
  return apiClient(`/players/${playerId}`, player);
}

