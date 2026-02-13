import { useState, useEffect, useCallback } from "react";
import { getLineupById, getTeam } from "../api";
import { getPlayers } from "../api";
import { toLineupData } from "../api/mappers";
import type { LineupData } from "../types";

interface UseLineupDataReturn {
  lineup: LineupData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook que busca uma escalação por ID, popula com dados dos jogadores
 * e do time, e retorna no formato pronto para o componente.
 */
export function useLineupData(lineupId: string): UseLineupDataReturn {
  const [lineup, setLineup] = useState<LineupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [apiLineup, team, players] = await Promise.all([
        getLineupById(lineupId),
        getTeam(),
        getPlayers(),
      ]);

      if (!apiLineup) {
        setError("Escalação não encontrada");
        return;
      }

      setLineup(toLineupData(apiLineup, players, team));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar escalação");
    } finally {
      setLoading(false);
    }
  }, [lineupId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    lineup,
    loading,
    error,
    refetch: fetchData,
  };
}

