import type { ApiLineup, ApiPlayer, ApiTeam, FieldRole } from "../types/api";
import type { LineupData, Player, LineupPlayers } from "../types";
import { FIELD_ROLE_ORDER } from "../constants";

/** Converte ApiPlayer → Player (formato usado nos componentes) */
function toPlayer(apiPlayer: ApiPlayer): Player {
  return {
    id: apiPlayer.id,
    number: apiPlayer.number,
    name: apiPlayer.name,
    birthDate: apiPlayer.birthDate,
    avatar: apiPlayer.avatar ?? undefined,
    position: apiPlayer.position,
    fieldRole: apiPlayer.fieldRole ?? undefined,
  };
}

/** Ordena jogadores pelo FIELD_ROLE_ORDER (quem não tem fieldRole fica no final) */
function sortByFieldRole(players: ApiPlayer[]): ApiPlayer[] {
  return [...players].sort((a, b) => {
    const orderA = a.fieldRole ? FIELD_ROLE_ORDER[a.fieldRole as FieldRole] ?? 99 : 99;
    const orderB = b.fieldRole ? FIELD_ROLE_ORDER[b.fieldRole as FieldRole] ?? 99 : 99;
    return orderA - orderB;
  });
}

/**
 * Distribui os starters na formação 4-3-1.
 * Usa o mapeamento position → grupo (gk/defenders/midfielders/attackers).
 */
function distributeByFormation(
  starters: ApiPlayer[]
): LineupPlayers {
  const gk = starters.find((p) => p.position === "GK") || starters[0];
  const fieldPlayers = starters.filter((p) => p.id !== gk.id);

  const defs = sortByFieldRole(fieldPlayers.filter((p) => p.position === "DEF"));
  const mids = sortByFieldRole(fieldPlayers.filter((p) => p.position === "MID"));
  const fwds = sortByFieldRole(fieldPlayers.filter((p) => p.position === "FWD"));

  // Se as posições batem com 4-3-1, usa elas; senão fallback sequencial
  if (defs.length === 4 && mids.length === 3 && fwds.length >= 1) {
    return {
      gk: toPlayer(gk),
      defenders: defs.map(toPlayer),
      midfielders: mids.map(toPlayer),
      attackers: fwds.map(toPlayer),
    };
  }

  // Fallback sequencial
  return {
    gk: toPlayer(gk),
    defenders: fieldPlayers.slice(0, 4).map(toPlayer),
    midfielders: fieldPlayers.slice(4, 7).map(toPlayer),
    attackers: fieldPlayers.slice(7, 8).map(toPlayer),
  };
}

/**
 * Converte uma ApiLineup (com starters/bench populados) para LineupData,
 * formato pronto para o componente SoccerLineup.
 */
export function toLineupData(
  lineup: ApiLineup,
  team: ApiTeam
): LineupData {
  return {
    formation: lineup.formation,
    teamName: team.name,
    teamColor: team.color ?? undefined,
    sponsorLogo: team.sponsorLogo ?? undefined,
    players: distributeByFormation(lineup.starters),
    bench: lineup.bench.map(toPlayer),
  };
}

/**
 * Overload para compatibilidade: aceita allPlayers separado.
 * Usado quando temos starterIds e precisamos resolver manualmente.
 */
export function toLineupDataFromIds(
  lineup: { formation: string; starterIds: string[]; benchIds: string[] },
  allPlayers: ApiPlayer[],
  team: ApiTeam
): LineupData {
  const starters = lineup.starterIds
    .map((id) => allPlayers.find((p) => p.id === id))
    .filter((p): p is ApiPlayer => p != null);

  const bench = lineup.benchIds
    .map((id) => allPlayers.find((p) => p.id === id))
    .filter((p): p is ApiPlayer => p != null);

  return {
    formation: lineup.formation,
    teamName: team.name,
    teamColor: team.color ?? undefined,
    sponsorLogo: team.sponsorLogo ?? undefined,
    players: distributeByFormation(starters),
    bench: bench.map(toPlayer),
  };
}

