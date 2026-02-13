/** Envelope padrão de resposta da API */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export interface ApiLoginRequest {
  email: string;
  password: string;
}

export interface ApiLoginResponse {
  token: string;
  coach: ApiCoach;
}

// ──────────────────────────────────────────────
// Coach
// ──────────────────────────────────────────────

export interface ApiCoach {
  id: string;
  name: string;
  email: string;
}

// ──────────────────────────────────────────────
// Team (1 coach = 1 time)
// ──────────────────────────────────────────────

export interface ApiTeam {
  id: string;
  coachId: string;
  name: string;
  color: string;
  badge?: string;
  year?: number;
  sponsor?: string;
  sponsorLogo?: string;
}

// ──────────────────────────────────────────────
// Player (pertence a um time)
// ──────────────────────────────────────────────

export interface ApiPlayer {
  id: string;
  teamId: string;
  number: number;
  name: string;
  birthDate: string; // "YYYY-MM-DD"
  avatar?: string;
  position: "GK" | "DEF" | "MID" | "FWD";
}

// ──────────────────────────────────────────────
// Lineup / Escalação (formação fixa 4-3-1)
// ──────────────────────────────────────────────

export interface ApiLineup {
  id: string;
  teamId: string;
  name: string;           // "Escalação principal"
  formation: string;      // "4-3-1"
  starterIds: string[];   // 9 IDs
  benchIds: string[];     // restante do elenco
  createdAt: string;
}

/** Lineup populada com os dados completos dos jogadores */
export interface ApiLineupPopulated {
  id: string;
  team: ApiTeam;
  name: string;
  formation: string;
  starters: ApiPlayer[];
  bench: ApiPlayer[];
  createdAt: string;
}

