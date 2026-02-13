/**
 * Tipos da API do backend Champions 315.
 * Nota: o backend usa snake_case, mas o client.ts converte
 * automaticamente para camelCase. Aqui usamos camelCase.
 */

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export interface ApiSignupRequest {
  name: string;
  email: string;
  password: string;
  avatar?: File;
}

export interface ApiSigninRequest {
  email: string;
  password: string;
}

export interface ApiSigninResponse {
  user: ApiUser;
}

// ──────────────────────────────────────────────
// User
// ──────────────────────────────────────────────

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
}

// ──────────────────────────────────────────────
// Team
// ──────────────────────────────────────────────

export interface ApiTeam {
  id: string;
  userId: string;
  name: string;
  color: string;
  badge: string | null;
  year: number | null;
  sponsor: string | null;
  sponsorLogo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTeamCreate {
  name: string;
  color: string;
  badge?: File;
  year?: number;
  sponsor?: string;
  sponsorLogo?: File;
}

export interface ApiTeamUpdate {
  name?: string;
  color?: string;
  badge?: File;
  year?: number | null;
  sponsor?: string | null;
  sponsorLogo?: File;
}

// ──────────────────────────────────────────────
// Player
// ──────────────────────────────────────────────

export type PlayerPosition = "GK" | "DEF" | "MID" | "FWD";

export type FieldRole = "GK" | "RL" | "RCB" | "LCB" | "LL" | "RM" | "CM" | "LM" | "RW" | "ST" | "LW";

export interface ApiPlayer {
  id: string;
  teamId: string;
  number: number;
  name: string;
  birthDate: string; // "YYYY-MM-DD"
  avatar: string | null;
  position: PlayerPosition;
  fieldRole: FieldRole | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPlayerCreate {
  number: number;
  name: string;
  birthDate: string;
  position: PlayerPosition;
  fieldRole?: FieldRole;
  avatar?: File;
}

export interface ApiPlayerUpdate {
  number?: number;
  name?: string;
  birthDate?: string;
  position?: PlayerPosition;
  fieldRole?: FieldRole;
  avatar?: File;
}

// ──────────────────────────────────────────────
// Lineup / Escalação (formação fixa 4-3-1)
// ──────────────────────────────────────────────

export interface ApiLineup {
  id: string;
  teamId: string;
  name: string;
  formation: string;
  starters: ApiPlayer[];
  bench: ApiPlayer[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiLineupCreate {
  name: string;
  formation: string;
  starterIds: string[];
  benchIds: string[];
}

export interface ApiLineupUpdate {
  name?: string;
  formation?: string;
  starterIds?: string[];
  benchIds?: string[];
}

// ──────────────────────────────────────────────
// Match / Partida
// ──────────────────────────────────────────────

export interface ApiMatchCard {
  id: string;
  matchId: string;
  playerId: string;
  type: "YELLOW" | "RED";
  minute: number | null;
  player?: ApiPlayer;
}

export interface ApiMatch {
  id: string;
  teamId: string;
  opponentName: string;
  teamScore: number;
  opponentScore: number;
  date: string; // "YYYY-MM-DD"
  notes: string | null;
  cards: ApiMatchCard[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiMatchCreate {
  opponentName: string;
  teamScore: number;
  opponentScore: number;
  date: string;
  notes?: string;
  cards?: { playerId: string; type: "YELLOW" | "RED"; minute?: number }[];
}

// ──────────────────────────────────────────────
// Error
// ──────────────────────────────────────────────

export interface ApiErrorResponse {
  status: string;
  message: string;
}

