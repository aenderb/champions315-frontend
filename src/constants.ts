import type { PlayerPosition, FieldRole } from "./types/api";

/** Idade mínima somada de todos os jogadores em campo */
export const AGE_LIMIT = 315;

/** Média mínima de idade quando há expulsão */
export const AVG_AGE_LIMIT = 35;

/** Quantidade de jogadores titulares (GK + 4 + 3 + 1) */
export const PLAYERS_ON_FIELD = 9;

/** Formação fixa do campeonato */
export const FORMATION = "4-3-1";

// ── Posições ──────────────────────────────────

/** Labels amigáveis para cada posição */
export const POSITION_LABELS: Record<PlayerPosition, string> = {
  GK: "Goleiro",
  DEF: "Defensor",
  MID: "Meio-campo",
  FWD: "Atacante",
};

/** Abreviações curtas para badges/cards */
export const POSITION_SHORT: Record<PlayerPosition, string> = {
  GK: "GOL",
  DEF: "DEF",
  MID: "MEI",
  FWD: "ATA",
};

/** Mapeamento posição → grupo de campo (para layout do campo) */
export type FieldGroup = "gk" | "defenders" | "midfielders" | "attackers";

export const POSITION_TO_GROUP: Record<PlayerPosition, FieldGroup> = {
  GK: "gk",
  DEF: "defenders",
  MID: "midfielders",
  FWD: "attackers",
};

/** Ordem numérica para ordenação por posição (campo → frente) */
export const POSITION_ORDER: Record<PlayerPosition, number> = {
  GK: 0, DEF: 1, MID: 2, FWD: 3,
};

/** Estrutura de slots da formação 4-3-1 */
export const FORMATION_SLOTS = [
  { group: "GK" as PlayerPosition, count: 1, label: "Goleiro" },
  { group: "DEF" as PlayerPosition, count: 4, label: "Defensores" },
  { group: "MID" as PlayerPosition, count: 3, label: "Meio-campistas" },
  { group: "FWD" as PlayerPosition, count: 1, label: "Atacante" },
] as const;

/** Todas as posições disponíveis para seleção em formulários */
export const ALL_POSITIONS: { value: PlayerPosition; label: string }[] = [
  { value: "GK",  label: "Goleiro" },
  { value: "DEF", label: "Defensor" },
  { value: "MID", label: "Meio-campo" },
  { value: "FWD", label: "Atacante" },
];

// ── Funções em campo (Field Role) ──────────────

/** Labels amigáveis para cada função em campo */
export const FIELD_ROLE_LABELS: Record<FieldRole, string> = {
  GK:  "Goleiro",
  RL:  "Lateral Direito",
  RCB: "Zagueiro Direito",
  LCB: "Zagueiro Esquerdo",
  LL:  "Lateral Esquerdo",
  RM:  "Meia Direita",
  CM:  "Volante",
  LM:  "Meia Esquerda",
  RW:  "Ponta Direita",
  ST:  "Centroavante",
  LW:  "Ponta Esquerda",
};

/** Abreviações curtas para field roles */
export const FIELD_ROLE_SHORT: Record<FieldRole, string> = {
  GK:  "GOL",
  RL:  "LD",
  RCB: "ZAG-D",
  LCB: "ZAG-E",
  LL:  "LE",
  RM:  "MD",
  CM:  "VOL",
  LM:  "ME",
  RW:  "PD",
  ST:  "CA",
  LW:  "PE",
};

/**
 * Mapeamento fieldRole → position (grupo de campo).
 * Usado para derivar automaticamente a posição a partir da função em campo.
 */
export const FIELD_ROLE_TO_POSITION: Record<FieldRole, PlayerPosition> = {
  GK:  "GK",
  RL:  "DEF",
  RCB: "DEF",
  LCB: "DEF",
  LL:  "DEF",
  RM:  "MID",
  CM:  "MID",
  LM:  "MID",
  RW:  "FWD",
  ST:  "FWD",
  LW:  "FWD",
};

/**
 * Ordem de renderização de cada fieldRole dentro da sua linha no campo.
 * Menor número = mais à esquerda (portrait) / mais ao topo (landscape).
 */
export const FIELD_ROLE_ORDER: Record<FieldRole, number> = {
  GK:  0,
  // Defensores: LL → LCB → RCB → RL
  LL:  0,
  LCB: 1,
  RCB: 2,
  RL:  3,
  // Meio-campistas: LM → CM → RM
  LM:  0,
  CM:  1,
  RM:  2,
  // Atacantes: LW → ST → RW
  LW:  0,
  ST:  1,
  RW:  2,
};

/** Todas as funções em campo para seleção em formulários */
export const ALL_FIELD_ROLES: { value: FieldRole; label: string }[] = [
  { value: "GK",  label: "Goleiro" },
  { value: "RL",  label: "Lateral Direito" },
  { value: "RCB", label: "Zagueiro Direito" },
  { value: "LCB", label: "Zagueiro Esquerdo" },
  { value: "LL",  label: "Lateral Esquerdo" },
  { value: "RM",  label: "Meia Direita" },
  { value: "CM",  label: "Volante" },
  { value: "LM",  label: "Meia Esquerda" },
  { value: "RW",  label: "Ponta Direita" },
  { value: "ST",  label: "Centroavante" },
  { value: "LW",  label: "Ponta Esquerda" },
];
