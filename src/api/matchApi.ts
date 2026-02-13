import { apiClient } from "./client";
import { mockTeam, mockLineups, mockCoach } from "../mocks";
import type { ApiTeam, ApiLineup, ApiCoach, ApiLoginResponse } from "../types/api";

// ── Auth ─────────────────────────────────────

/** Simula login do coach */
export async function login(
  _email: string,
  _password: string
): Promise<ApiLoginResponse> {
  return apiClient("/auth/login", {
    token: "mock-jwt-token-123",
    coach: mockCoach,
  });
}

/** Busca dados do coach logado */
export async function getCoach(): Promise<ApiCoach> {
  return apiClient("/coach/me", mockCoach);
}

// ── Team ─────────────────────────────────────

/** Busca o time do coach */
export async function getTeam(): Promise<ApiTeam> {
  return apiClient("/team", mockTeam);
}

// ── Lineups ──────────────────────────────────

/** Busca todas as escalações do time */
export async function getLineups(): Promise<ApiLineup[]> {
  return apiClient("/lineups", mockLineups);
}

/** Busca uma escalação por ID */
export async function getLineupById(
  lineupId: string
): Promise<ApiLineup | undefined> {
  const lineup = mockLineups.find((l) => l.id === lineupId);
  return apiClient(`/lineups/${lineupId}`, lineup);
}

