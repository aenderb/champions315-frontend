// ──────────────────────────────────────────────
// Domínio: User → Team → Players → Lineups
// ──────────────────────────────────────────────

/** Usuário autenticado */
export interface User {
  id: string;
  name: string;
  email: string;
}

/** Jogador cadastrado pelo usuário */
export interface Player {
  id: string;
  number: number;
  name: string;
  birthDate: string; // "YYYY-MM-DD"
  avatar?: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  fieldRole?: string;
}

/** Time cadastrado pelo usuário (1 user = 1 time) */
export interface Team {
  id: string;
  userId: string;
  name: string;
  color: string;
  badge?: string;        // URL/base64 do escudo
  year?: number;         // Ano de fundação
  sponsor?: string;      // Nome do patrocinador
  sponsorLogo?: string;  // URL/base64 do logo do patrocinador
  players: Player[];
}

// ──────────────────────────────────────────────
// Escalação (formação fixa 4-3-1 + GK = 9)
// ──────────────────────────────────────────────

/** Distribuição dos jogadores em campo */
export interface LineupPlayers {
  gk: Player | null;
  defenders: (Player | null)[];   // 4
  midfielders: (Player | null)[]; // 3
  attackers: (Player | null)[];   // 1
}

/** Escalação salva pelo usuário */
export interface Lineup {
  id: string;
  teamId: string;
  name: string;              // Ex: "Escalação principal"
  formation: string;         // Fixo "4-3-1"
  starterIds: string[];      // 9 IDs dos titulares
  benchIds: string[];        // Restante do elenco
  createdAt: string;
}

/** Dados prontos para o componente de visualização */
export interface LineupData {
  formation: string;
  teamName: string;
  teamColor?: string;
  sponsorLogo?: string;
  players: LineupPlayers;
  bench: Player[];
}

/** Identifica a posição vazia no campo durante uma substituição */
export interface EmptySlot {
  group: "gk" | "defenders" | "midfielders" | "attackers";
  index: number; // -1 para gk
}

// ──────────────────────────────────────────────
// Constantes de regra de negócio
// ──────────────────────────────────────────────

/** Formação fixa do campeonato */
export const FORMATION = "4-3-1";

/** Quantidade de jogadores em campo (GK + 4 + 3 + 1) */
export const PLAYERS_ON_FIELD = 9;

