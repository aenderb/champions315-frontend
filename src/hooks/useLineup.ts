import { useState, useCallback, useMemo } from "react";
import type { Player, LineupPlayers, EmptySlot } from "../types";
import { AGE_LIMIT, AVG_AGE_LIMIT } from "../constants";
import { calcAge } from "../utils/age";

interface UseLineupParams {
  initialPlayers: LineupPlayers;
  initialBench: Player[];
}

export interface YellowCard {
  playerId: string;
  playerNumber: number;
  playerName: string;
}

export function useLineup({ initialPlayers, initialBench }: UseLineupParams) {
  const [players, setPlayers] = useState<LineupPlayers>(initialPlayers);
  const [bench, setBench] = useState<Player[]>(initialBench);

  /** Posição selecionada no campo (aguardando ação) */
  const [selectedSlot, setSelectedSlot] = useState<EmptySlot | null>(null);

  /** Cartões amarelos dados */
  const [yellowCards, setYellowCards] = useState<YellowCard[]>([]);

  /** Jogadores expulsos (para exibir na barra de reservas) */
  const [expelledPlayers, setExpelledPlayers] = useState<Player[]>([]);

  /** Quantidade de jogadores expulsos */
  const expelledCount = expelledPlayers.length;

  /** Jogadores atualmente em campo (sem nulls) */
  const onFieldPlayers = useMemo<Player[]>(() => {
    return [
      players.gk,
      ...players.defenders,
      ...players.midfielders,
      ...players.attackers,
    ].filter((p): p is Player => p !== null);
  }, [players]);

  /** Soma das idades dos jogadores em campo */
  const totalAge = useMemo(() => {
    return onFieldPlayers.reduce((sum, p) => sum + calcAge(p.birthDate), 0);
  }, [onFieldPlayers]);

  /** Houve expulsão? */
  const hasExpulsions = expelledCount > 0;

  /** Média de idade dos jogadores em campo */
  const averageAge =
    onFieldPlayers.length > 0
      ? Math.round((totalAge / onFieldPlayers.length) * 10) / 10
      : 0;

  /** Está abaixo do limite? */
  const isBelowLimit = hasExpulsions
    ? averageAge < AVG_AGE_LIMIT
    : totalAge < AGE_LIMIT;

  /** Jogador atualmente selecionado */
  const selectedPlayer = useMemo<Player | null>(() => {
    if (!selectedSlot) return null;
    if (selectedSlot.group === "gk") return players.gk;
    return players[selectedSlot.group][selectedSlot.index] ?? null;
  }, [selectedSlot, players]);

  // ─── Ações ──────────────────────────────────────

  /** Selecionar jogador no campo (1º clique) */
  const selectPlayer = useCallback(
    (group: EmptySlot["group"], index: number) => {
      if (selectedSlot) return;
      setSelectedSlot({ group, index });
    },
    [selectedSlot]
  );

  /** Cancelar seleção */
  const cancelSelection = useCallback(() => {
    setSelectedSlot(null);
  }, []);

  /** Substituir: field player ↔ bench player */
  const substitutePlayer = useCallback(
    (benchIndex: number) => {
      if (!selectedSlot) return;

      const benchPlayer = bench[benchIndex];
      const fieldPlayer =
        selectedSlot.group === "gk"
          ? players.gk
          : players[selectedSlot.group][selectedSlot.index];

      setPlayers((prev) => {
        const next = { ...prev };
        if (selectedSlot.group === "gk") {
          next.gk = benchPlayer;
        } else {
          const arr = [...next[selectedSlot.group]];
          arr[selectedSlot.index] = benchPlayer;
          next[selectedSlot.group] = arr;
        }
        return next;
      });

      setBench((prev) => {
        const newBench = prev.filter((_, i) => i !== benchIndex);
        if (fieldPlayer) newBench.push(fieldPlayer);
        return newBench;
      });

      setSelectedSlot(null);
    },
    [selectedSlot, bench, players]
  );

  /** Expulsar jogador selecionado (cartão vermelho) */
  const expelSelectedPlayer = useCallback(() => {
    if (!selectedSlot || !selectedPlayer) return;

    // Guardar o jogador antes de remover
    const expelled = selectedPlayer;

    setPlayers((prev) => {
      const next = { ...prev };
      if (selectedSlot.group === "gk") {
        next.gk = null;
      } else {
        const arr = [...prev[selectedSlot.group]];
        arr.splice(selectedSlot.index, 1);
        next[selectedSlot.group] = arr;
      }
      return next;
    });

    setExpelledPlayers((prev) => [...prev, expelled]);
    setSelectedSlot(null);
  }, [selectedSlot, selectedPlayer]);

  /** Set de IDs que já tomaram amarelo */
  const yellowCardIds = useMemo(
    () => new Set(yellowCards.map((c) => c.playerId)),
    [yellowCards]
  );

  /** Dar cartão amarelo ao jogador selecionado (máx 1 por jogador) */
  const giveYellowCard = useCallback(() => {
    if (!selectedSlot || !selectedPlayer) return;
    if (yellowCardIds.has(selectedPlayer.id)) {
      // Já tomou amarelo — ignora
      setSelectedSlot(null);
      return;
    }

    setYellowCards((prev) => [
      ...prev,
      {
        playerId: selectedPlayer.id,
        playerNumber: selectedPlayer.number,
        playerName: selectedPlayer.name,
      },
    ]);

    setSelectedSlot(null);
  }, [selectedSlot, selectedPlayer, yellowCardIds]);

  return {
    players,
    bench,
    selectedSlot,
    selectedPlayer,
    totalAge,
    averageAge,
    isBelowLimit,
    hasExpulsions,
    expelledPlayers,
    expelledCount,
    yellowCards,
    yellowCardIds,
    onFieldPlayers,
    selectPlayer,
    cancelSelection,
    substitutePlayer,
    expelSelectedPlayer,
    giveYellowCard,
  };
}
