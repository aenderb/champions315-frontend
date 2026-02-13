import type { ApiLineup, ApiPlayer, ApiTeam } from "../types/api";
import type { LineupData, Player, LineupPlayers } from "../types";

/** Converte ApiPlayer → Player (formato usado nos componentes) */
function toPlayer(apiPlayer: ApiPlayer): Player {
  return {
    id: apiPlayer.id,
    number: apiPlayer.number,
    name: apiPlayer.name,
    birthDate: apiPlayer.birthDate,
    avatar: apiPlayer.avatar,
    position: apiPlayer.position,
  };
}

/**
 * Distribui os starters na formação 4-3-1.
 * Tenta respeitar a posição original, senão distribui sequencialmente.
 */
function distributeByFormation(
  starters: ApiPlayer[]
): LineupPlayers {
  const gk = starters.find((p) => p.position === "GK") || starters[0];
  const fieldPlayers = starters.filter((p) => p.id !== gk.id);

  const defs = fieldPlayers.filter((p) => p.position === "DEF");
  const mids = fieldPlayers.filter((p) => p.position === "MID");
  const fwds = fieldPlayers.filter((p) => p.position === "FWD");

  let defenders: ApiPlayer[];
  let midfielders: ApiPlayer[];
  let attackers: ApiPlayer[];

  // Se as posições batem com 4-3-1, usa elas
  if (defs.length === 4 && mids.length === 3 && fwds.length === 1) {
    defenders = defs;
    midfielders = mids;
    attackers = fwds;
  } else {
    // Fallback sequencial
    defenders = fieldPlayers.slice(0, 4);
    midfielders = fieldPlayers.slice(4, 7);
    attackers = fieldPlayers.slice(7, 8);
  }

  return {
    gk: toPlayer(gk),
    defenders: defenders.map(toPlayer),
    midfielders: midfielders.map(toPlayer),
    attackers: attackers.map(toPlayer),
  };
}

/**
 * Popula uma ApiLineup com os dados dos jogadores e do time,
 * retornando o formato pronto para o componente SoccerLineup.
 */
export function toLineupData(
  lineup: ApiLineup,
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
    teamColor: team.color,
    players: distributeByFormation(starters),
    bench: bench.map(toPlayer),
  };
}

