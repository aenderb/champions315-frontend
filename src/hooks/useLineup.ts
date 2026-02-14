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

export type GkReplacementPhase = null | "choose-replacement" | "choose-outfielder-to-remove";

export function useLineup({ initialPlayers, initialBench }: UseLineupParams) {
  const [players, setPlayers] = useState<LineupPlayers>(initialPlayers);
  const [bench, setBench] = useState<Player[]>(initialBench);

  /** Posição selecionada no campo (aguardando ação) */
  const [selectedSlot, setSelectedSlot] = useState<EmptySlot | null>(null);

  /** Cartões amarelos dados */
  const [yellowCards, setYellowCards] = useState<YellowCard[]>([]);

  /** Jogadores expulsos (para exibir na barra de reservas) */
  const [expelledPlayers, setExpelledPlayers] = useState<Player[]>([]);

  /** Fase de substituição do goleiro expulso */
  const [gkReplacementPhase, setGkReplacementPhase] = useState<GkReplacementPhase>(null);

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

  /** Substituição pendente aguardando confirmação do usuário */
  const [pendingSub, setPendingSub] = useState<{
    benchIndex: number;
    newTotalAge: number;
  } | null>(null);

  /** Substituir: field player ↔ bench player */
  const substitutePlayer = useCallback(
    (benchIndex: number) => {
      if (!selectedSlot) return;

      const benchPlayer = bench[benchIndex];
      const fieldPlayer =
        selectedSlot.group === "gk"
          ? players.gk
          : players[selectedSlot.group][selectedSlot.index];

      // Simular a nova soma de idades
      const fieldPlayerAge = fieldPlayer ? calcAge(fieldPlayer.birthDate) : 0;
      const benchPlayerAge = calcAge(benchPlayer.birthDate);
      const newTotal = totalAge - fieldPlayerAge + benchPlayerAge;

      // Se vai ficar abaixo do limite e atualmente está acima, pedir confirmação
      if (newTotal < AGE_LIMIT && totalAge >= AGE_LIMIT && !hasExpulsions) {
        setPendingSub({ benchIndex, newTotalAge: newTotal });
        return;
      }

      // Executar troca diretamente
      executeSubstitution(benchIndex);
    },
    [selectedSlot, bench, players, totalAge, hasExpulsions]
  );

  /** Executar a substituição de fato */
  const executeSubstitution = useCallback(
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
          const group = selectedSlot.group as "defenders" | "midfielders" | "attackers";
          const arr = [...next[group]];
          arr[selectedSlot.index] = benchPlayer;
          next[group] = arr;
        }
        return next;
      });

      setBench((prev) => {
        const newBench = prev.filter((_, i) => i !== benchIndex);
        if (fieldPlayer) newBench.push(fieldPlayer);
        return newBench;
      });

      setSelectedSlot(null);
      setPendingSub(null);
    },
    [selectedSlot, bench, players]
  );

  /** Confirmar substituição pendente */
  const confirmPendingSub = useCallback(() => {
    if (!pendingSub) return;
    executeSubstitution(pendingSub.benchIndex);
  }, [pendingSub, executeSubstitution]);

  /** Cancelar substituição pendente */
  const cancelPendingSub = useCallback(() => {
    setPendingSub(null);
    setSelectedSlot(null);
  }, []);

  /** Expulsar jogador selecionado (cartão vermelho) */
  const expelSelectedPlayer = useCallback(() => {
    if (!selectedSlot || !selectedPlayer) return;

    // Guardar o jogador antes de remover
    const expelled = selectedPlayer;
    const isGk = selectedSlot.group === "gk";

    setPlayers((prev) => {
      const next = { ...prev };
      if (isGk) {
        next.gk = null;
      } else {
        const group = selectedSlot.group as "defenders" | "midfielders" | "attackers";
        const arr = [...prev[group]];
        arr.splice(selectedSlot.index, 1);
        next[group] = arr;
      }
      return next;
    });

    setExpelledPlayers((prev) => [...prev, expelled]);
    setSelectedSlot(null);

    // Se o goleiro foi expulso, iniciar fluxo de substituição obrigatória
    if (isGk) {
      setGkReplacementPhase("choose-replacement");
    }
  }, [selectedSlot, selectedPlayer]);

  // ─── Substituição obrigatória do goleiro expulso ──────────

  /** Substituir goleiro expulso por jogador do banco */
  const replaceGkFromBench = useCallback(
    (benchIndex: number) => {
      if (gkReplacementPhase !== "choose-replacement") return;

      const benchPlayer = bench[benchIndex];

      // Colocar o jogador como goleiro
      setPlayers((prev) => ({ ...prev, gk: benchPlayer }));
      setBench((prev) => prev.filter((_, i) => i !== benchIndex));

      // Sempre exigir que um jogador de linha saia do campo
      setGkReplacementPhase("choose-outfielder-to-remove");
    },
    [gkReplacementPhase, bench]
  );

  /** Substituir goleiro expulso por jogador de linha em campo */
  const replaceGkFromField = useCallback(
    (group: "defenders" | "midfielders" | "attackers", index: number) => {
      if (gkReplacementPhase !== "choose-replacement") return;

      const fieldPlayer = players[group][index];
      if (!fieldPlayer) return;

      // Move o jogador de linha para a posição de goleiro
      setPlayers((prev) => {
        const next = { ...prev };
        next.gk = fieldPlayer;
        const arr = [...prev[group]];
        arr.splice(index, 1);
        next[group] = arr;
        return next;
      });

      setGkReplacementPhase(null);
    },
    [gkReplacementPhase, players]
  );

  /** Remover jogador de linha após goleiro reserva entrar (2ª etapa) */
  const removeOutfielderForGkReplacement = useCallback(
    (group: "defenders" | "midfielders" | "attackers", index: number) => {
      if (gkReplacementPhase !== "choose-outfielder-to-remove") return;

      const fieldPlayer = players[group][index];
      if (!fieldPlayer) return;

      // Remove o jogador de linha do campo e coloca no banco
      setPlayers((prev) => {
        const next = { ...prev };
        const arr = [...prev[group]];
        arr.splice(index, 1);
        next[group] = arr;
        return next;
      });

      setBench((prev) => [...prev, fieldPlayer]);
      setGkReplacementPhase(null);
    },
    [gkReplacementPhase, players]
  );

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
    gkReplacementPhase,
    pendingSub,
    selectPlayer,
    cancelSelection,
    substitutePlayer,
    confirmPendingSub,
    cancelPendingSub,
    expelSelectedPlayer,
    giveYellowCard,
    replaceGkFromBench,
    replaceGkFromField,
    removeOutfielderForGkReplacement,
  };
}
