import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";

// ── Tipos locais (sem depender de domínio completo) ──

export interface TeamEntry {
  id: string;
  name: string;
  color: string;
  badge: string | null;
  year: string;
  sponsor: string;
  sponsorLogo: string | null;
}

export interface PlayerEntry {
  id: string;
  teamId: string;
  number: number;
  name: string;
  birthDate: string; // "YYYY-MM-DD"
  position: "GK" | "DEF" | "MID" | "FWD";
  avatar: string | null;
}

export interface LineupEntry {
  id: string;
  teamId: string;
  name: string;
  starterIds: string[];  // 9 IDs (ordem: GK, DEF×4, MID×3, FWD×1)
  benchIds: string[];
  createdAt: string;
}

interface DataContextType {
  // Active team
  activeTeamId: string | null;
  activeTeam: TeamEntry | undefined;
  setActiveTeamId: (id: string | null) => void;
  // Teams CRUD
  teams: TeamEntry[];
  addTeam: (team: Omit<TeamEntry, "id">) => void;
  updateTeam: (id: string, data: Partial<Omit<TeamEntry, "id">>) => void;
  removeTeam: (id: string) => void;
  getTeamById: (teamId: string) => TeamEntry | undefined;
  // Players CRUD
  players: PlayerEntry[];
  addPlayer: (player: Omit<PlayerEntry, "id">) => void;
  updatePlayer: (id: string, data: Partial<Omit<PlayerEntry, "id">>) => void;
  removePlayer: (id: string) => void;
  getPlayersByTeam: (teamId: string) => PlayerEntry[];
  activeTeamPlayers: PlayerEntry[];
  // Lineups CRUD
  lineups: LineupEntry[];
  addLineup: (lineup: Omit<LineupEntry, "id" | "createdAt">) => void;
  updateLineup: (id: string, data: Partial<Omit<LineupEntry, "id" | "createdAt">>) => void;
  removeLineup: (id: string) => void;
  getLineupsByTeam: (teamId: string) => LineupEntry[];
  activeTeamLineups: LineupEntry[];
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<TeamEntry[]>([]);
  const [players, setPlayers] = useState<PlayerEntry[]>([]);
  const [lineups, setLineups] = useState<LineupEntry[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

  // ── Teams ──
  const addTeam = useCallback((team: Omit<TeamEntry, "id">) => {
    const id = `team-${Date.now()}`;
    setTeams((prev) => [...prev, { id, ...team }]);
    // Auto-ativar se for a primeira equipe
    setActiveTeamId((prev) => prev ?? id);
  }, []);

  const updateTeam = useCallback((id: string, data: Partial<Omit<TeamEntry, "id">>) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const removeTeam = useCallback((id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
    // Remover jogadores e escalações vinculados
    setPlayers((prev) => prev.filter((p) => p.teamId !== id));
    setLineups((prev) => prev.filter((l) => l.teamId !== id));
    // Desativar se era a equipe ativa
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
  const addPlayer = useCallback((player: Omit<PlayerEntry, "id">) => {
    setPlayers((prev) => [...prev, { id: `player-${Date.now()}`, ...player }]);
  }, []);

  const updatePlayer = useCallback((id: string, data: Partial<Omit<PlayerEntry, "id">>) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    // Remover de escalações que contêm esse jogador
    setLineups((prev) =>
      prev.map((l) => ({
        ...l,
        starterIds: l.starterIds.filter((sid) => sid !== id),
        benchIds: l.benchIds.filter((bid) => bid !== id),
      }))
    );
  }, []);

  const getPlayersByTeam = useCallback(
    (teamId: string) => players.filter((p) => p.teamId === teamId),
    [players]
  );

  const activeTeamPlayers = useMemo(
    () => (activeTeamId ? players.filter((p) => p.teamId === activeTeamId) : []),
    [players, activeTeamId]
  );

  // ── Lineups ──
  const addLineup = useCallback((lineup: Omit<LineupEntry, "id" | "createdAt">) => {
    setLineups((prev) => [
      ...prev,
      { id: `lineup-${Date.now()}`, createdAt: new Date().toISOString(), ...lineup },
    ]);
  }, []);

  const updateLineup = useCallback((id: string, data: Partial<Omit<LineupEntry, "id" | "createdAt">>) => {
    setLineups((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
  }, []);

  const removeLineup = useCallback((id: string) => {
    setLineups((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const getLineupsByTeam = useCallback(
    (teamId: string) => lineups.filter((l) => l.teamId === teamId),
    [lineups]
  );

  const activeTeamLineups = useMemo(
    () => (activeTeamId ? lineups.filter((l) => l.teamId === activeTeamId) : []),
    [lineups, activeTeamId]
  );

  return (
    <DataContext.Provider
      value={{
        activeTeamId, activeTeam, setActiveTeamId,
        teams, addTeam, updateTeam, removeTeam, getTeamById,
        players, addPlayer, updatePlayer, removePlayer, getPlayersByTeam, activeTeamPlayers,
        lineups, addLineup, updateLineup, removeLineup, getLineupsByTeam, activeTeamLineups,
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
