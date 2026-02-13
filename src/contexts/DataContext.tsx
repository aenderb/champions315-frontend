import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import * as teamApi from "../api/teamApi";
import * as playerApi from "../api/playerApi";
import * as lineupApi from "../api/lineupApi";
import * as matchApi from "../api/matchApi";
import type { ApiTeam, ApiPlayer, ApiLineup, ApiMatch, ApiMatchCreate, PlayerPosition, FieldRole } from "../types/api";
import { POSITION_ORDER, FIELD_ROLE_TO_POSITION } from "../constants";

// ── Tipos re-exportados (mantém compatibilidade com componentes) ──

export type TeamEntry = ApiTeam & {
  /** Alias para year como string (compatibilidade com forms) */
};

export type PlayerEntry = ApiPlayer;

export type MatchEntry = ApiMatch;

export interface LineupEntry {
  id: string;
  teamId: string;
  name: string;
  formation: string;
  starters: ApiPlayer[];
  bench: ApiPlayer[];
  starterIds: string[];
  benchIds: string[];
  createdAt: string;
}

function toLineupEntry(l: ApiLineup): LineupEntry {
  // Ordena titulares pela posição (GK → DEF → MID → FWD)
  // e por número dentro da mesma posição para ordem determinística
  const sortedStarters = [...l.starters].sort((a, b) => {
    const posDiff = (POSITION_ORDER[a.position] ?? 99) - (POSITION_ORDER[b.position] ?? 99);
    if (posDiff !== 0) return posDiff;
    return a.number - b.number;
  });
  return {
    ...l,
    starterIds: sortedStarters.map((p) => p.id),
    benchIds: l.bench.map((p) => p.id),
  };
}

interface DataContextType {
  // Active team
  activeTeamId: string | null;
  activeTeam: TeamEntry | undefined;
  setActiveTeamId: (id: string | null) => void;
  // Teams CRUD
  teams: TeamEntry[];
  addTeam: (team: { name: string; color: string; badge?: string | null; badgeFile?: File; year?: string; sponsor?: string; sponsorLogo?: string | null; sponsorLogoFile?: File }) => Promise<void>;
  updateTeam: (id: string, data: Partial<{ name: string; color: string; badge: string | null; badgeFile?: File; year: string; sponsor: string; sponsorLogo: string | null; sponsorLogoFile?: File }>) => Promise<void>;
  removeTeam: (id: string) => Promise<void>;
  getTeamById: (teamId: string) => TeamEntry | undefined;
  // Players CRUD
  players: PlayerEntry[];
  addPlayer: (player: { teamId: string; number: number; name: string; birthDate: string; fieldRole: FieldRole; avatar: string | null; avatarFile?: File }) => Promise<void>;
  updatePlayer: (id: string, data: Partial<{ number: number; name: string; birthDate: string; fieldRole: FieldRole; avatar: string | null; avatarFile?: File }>) => Promise<void>;
  removePlayer: (id: string) => Promise<void>;
  getPlayersByTeam: (teamId: string) => PlayerEntry[];
  activeTeamPlayers: PlayerEntry[];
  // Lineups CRUD
  lineups: LineupEntry[];
  addLineup: (lineup: { teamId: string; name: string; starterIds: string[]; benchIds: string[] }) => Promise<void>;
  updateLineup: (id: string, data: Partial<{ name: string; starterIds: string[]; benchIds: string[] }>) => Promise<void>;
  removeLineup: (id: string) => Promise<void>;
  getLineupsByTeam: (teamId: string) => LineupEntry[];
  activeTeamLineups: LineupEntry[];
  // Matches
  matches: MatchEntry[];
  addMatch: (teamId: string, data: ApiMatchCreate) => Promise<void>;
  removeMatch: (teamId: string, matchId: string) => Promise<void>;
  getMatchesByTeam: (teamId: string) => MatchEntry[];
  activeTeamMatches: MatchEntry[];
  // Loading
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [teams, setTeams] = useState<TeamEntry[]>([]);
  const [players, setPlayers] = useState<PlayerEntry[]>([]);
  const [lineups, setLineups] = useState<LineupEntry[]>([]);
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Carregar dados quando logado ──
  const refreshData = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const fetchedTeams = await teamApi.getTeams();
      setTeams(fetchedTeams);

      // Auto-ativar primeiro time se nenhum ativo
      setActiveTeamId((prev) => {
        if (prev && fetchedTeams.some((t) => t.id === prev)) return prev;
        return fetchedTeams[0]?.id ?? null;
      });

      // Buscar jogadores, escalações e partidas de todos os times
      const allPlayers: PlayerEntry[] = [];
      const allLineups: LineupEntry[] = [];
      const allMatches: MatchEntry[] = [];

      await Promise.all(
        fetchedTeams.map(async (team) => {
          // Busca cada recurso independentemente para que falha parcial não impeça os demais
          const [playersResult, lineupsResult, matchesResult] = await Promise.allSettled([
            playerApi.getPlayers(team.id),
            lineupApi.getLineups(team.id),
            matchApi.getMatches(team.id),
          ]);

          if (playersResult.status === "fulfilled") allPlayers.push(...playersResult.value);
          else console.warn(`Erro ao carregar jogadores do time ${team.name}:`, playersResult.reason);

          if (lineupsResult.status === "fulfilled") allLineups.push(...lineupsResult.value.map(toLineupEntry));
          else console.warn(`Erro ao carregar escalações do time ${team.name}:`, lineupsResult.reason);

          if (matchesResult.status === "fulfilled") allMatches.push(...matchesResult.value);
          else console.warn(`Erro ao carregar partidas do time ${team.name}:`, matchesResult.reason);
        })
      );

      setPlayers(allPlayers);
      setLineups(allLineups);
      setMatches(allMatches);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      refreshData();
    } else {
      // Limpar tudo ao deslogar
      setTeams([]);
      setPlayers([]);
      setLineups([]);
      setMatches([]);
      setActiveTeamId(null);
    }
  }, [isLoggedIn, refreshData]);

  // ── Teams ──
  const addTeam = useCallback(async (data: { name: string; color: string; badge?: string | null; badgeFile?: File; year?: string; sponsor?: string; sponsorLogo?: string | null; sponsorLogoFile?: File }) => {
    const created = await teamApi.createTeam({
      name: data.name,
      color: data.color,
      badge: data.badgeFile,
      year: data.year ? parseInt(data.year, 10) : undefined,
      sponsor: data.sponsor || undefined,
      sponsorLogo: data.sponsorLogoFile,
    });
    setTeams((prev) => [...prev, created]);
    setActiveTeamId((prev) => prev ?? created.id);
  }, []);

  const updateTeam = useCallback(async (id: string, data: Partial<{ name: string; color: string; badge: string | null; badgeFile?: File; year: string; sponsor: string; sponsorLogo: string | null; sponsorLogoFile?: File }>) => {
    const updated = await teamApi.updateTeam(id, {
      name: data.name,
      color: data.color,
      badge: data.badgeFile,
      year: data.year ? parseInt(data.year, 10) : data.year === "" ? null : undefined,
      sponsor: data.sponsor,
      sponsorLogo: data.sponsorLogoFile,
    });
    setTeams((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const removeTeam = useCallback(async (id: string) => {
    await teamApi.deleteTeam(id);
    setTeams((prev) => prev.filter((t) => t.id !== id));
    setPlayers((prev) => prev.filter((p) => p.teamId !== id));
    setLineups((prev) => prev.filter((l) => l.teamId !== id));
    setActiveTeamId((prev) => (prev === id ? null : prev));
  }, []);

  const getTeamById = useCallback(
    (teamId: string) => teams.find((t) => t.id === teamId),
    [teams]
  );

  const activeTeam = useMemo(
    () => (activeTeamId ? teams.find((t) => t.id === activeTeamId) : undefined),
    [teams, activeTeamId]
  );

  // ── Players ──
  const addPlayer = useCallback(async (data: { teamId: string; number: number; name: string; birthDate: string; fieldRole: FieldRole; avatar: string | null; avatarFile?: File }) => {
    const created = await playerApi.createPlayer(data.teamId, {
      number: data.number,
      name: data.name,
      birthDate: data.birthDate,
      position: FIELD_ROLE_TO_POSITION[data.fieldRole],
      fieldRole: data.fieldRole,
      avatar: data.avatarFile,
    });
    setPlayers((prev) => [...prev, created]);
  }, []);

  const updatePlayer = useCallback(async (id: string, data: Partial<{ teamId: string; number: number; name: string; birthDate: string; fieldRole: FieldRole; avatar: string | null; avatarFile?: File }>) => {
    // Precisamos saber o teamId do jogador
    const player = players.find((p) => p.id === id);
    if (!player) return;
    const updated = await playerApi.updatePlayer(player.teamId, id, {
      number: data.number,
      name: data.name,
      birthDate: data.birthDate,
      position: data.fieldRole ? FIELD_ROLE_TO_POSITION[data.fieldRole] : undefined,
      fieldRole: data.fieldRole,
      avatar: data.avatarFile,
    });
    setPlayers((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, [players]);

  const removePlayer = useCallback(async (id: string) => {
    const player = players.find((p) => p.id === id);
    if (!player) return;
    await playerApi.deletePlayer(player.teamId, id);
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setLineups((prev) =>
      prev.map((l) => ({
        ...l,
        starterIds: l.starterIds.filter((sid) => sid !== id),
        benchIds: l.benchIds.filter((bid) => bid !== id),
      }))
    );
  }, [players]);

  const getPlayersByTeam = useCallback(
    (teamId: string) => players.filter((p) => p.teamId === teamId),
    [players]
  );

  const activeTeamPlayers = useMemo(
    () => (activeTeamId ? players.filter((p) => p.teamId === activeTeamId) : []),
    [players, activeTeamId]
  );

  // ── Lineups ──
  const addLineup = useCallback(async (data: { teamId: string; name: string; starterIds: string[]; benchIds: string[] }) => {
    const created = await lineupApi.createLineup(data.teamId, {
      name: data.name,
      formation: "4-3-1",
      starterIds: data.starterIds,
      benchIds: data.benchIds,
    });
    setLineups((prev) => [...prev, toLineupEntry(created)]);
  }, []);

  const updateLineup = useCallback(async (id: string, data: Partial<{ name: string; starterIds: string[]; benchIds: string[] }>) => {
    const lineup = lineups.find((l) => l.id === id);
    if (!lineup) return;
    const updated = await lineupApi.updateLineup(lineup.teamId, id, {
      name: data.name,
      starterIds: data.starterIds,
      benchIds: data.benchIds,
    });
    setLineups((prev) => prev.map((l) => (l.id === id ? toLineupEntry(updated) : l)));
  }, [lineups]);

  const removeLineup = useCallback(async (id: string) => {
    const lineup = lineups.find((l) => l.id === id);
    if (!lineup) return;
    await lineupApi.deleteLineup(lineup.teamId, id);
    setLineups((prev) => prev.filter((l) => l.id !== id));
  }, [lineups]);

  const getLineupsByTeam = useCallback(
    (teamId: string) => lineups.filter((l) => l.teamId === teamId),
    [lineups]
  );

  const activeTeamLineups = useMemo(
    () => (activeTeamId ? lineups.filter((l) => l.teamId === activeTeamId) : []),
    [lineups, activeTeamId]
  );

  // ── Matches ──
  const addMatch = useCallback(async (teamId: string, data: ApiMatchCreate) => {
    const created = await matchApi.createMatch(teamId, data);
    setMatches((prev) => [...prev, created]);
  }, []);

  const removeMatch = useCallback(async (teamId: string, matchId: string) => {
    await matchApi.deleteMatch(teamId, matchId);
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  }, []);

  const getMatchesByTeam = useCallback(
    (teamId: string) => matches.filter((m) => m.teamId === teamId),
    [matches]
  );

  const activeTeamMatches = useMemo(
    () => (activeTeamId ? matches.filter((m) => m.teamId === activeTeamId) : []),
    [matches, activeTeamId]
  );

  return (
    <DataContext.Provider
      value={{
        activeTeamId, activeTeam, setActiveTeamId,
        teams, addTeam, updateTeam, removeTeam, getTeamById,
        players, addPlayer, updatePlayer, removePlayer, getPlayersByTeam, activeTeamPlayers,
        lineups, addLineup, updateLineup, removeLineup, getLineupsByTeam, activeTeamLineups,
        matches, addMatch, removeMatch, getMatchesByTeam, activeTeamMatches,
        loading, refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData deve ser usado dentro de DataProvider");
  return ctx;
}
