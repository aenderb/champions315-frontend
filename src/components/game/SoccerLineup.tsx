import type { LineupData } from "../../types";
import { useState, useCallback } from "react";
import { useLineup } from "../../hooks/useLineup";
import { useGameTimer } from "../../hooks/useGameTimer";
import { InfoBar } from "./InfoBar";
import { SoccerField } from "./SoccerField";
import { BenchList } from "./BenchList";
import { GameSummary } from "./GameSummary";
import type { GameResult } from "./GameSummary";
import type { EmptySlot } from "../../types";

interface LineupOption {
  id: string;
  name: string;
}

interface SoccerLineupProps {
  lineup: LineupData;
  lineupOptions: LineupOption[];
  selectedLineupId: string;
  onLineupChange: (id: string) => void;
  onGameSaved: (result: GameResult) => void;
}

export default function SoccerLineup({
  lineup,
  lineupOptions,
  selectedLineupId,
  onLineupChange,
  onGameSaved,
}: SoccerLineupProps) {
  const [gameFinished, setGameFinished] = useState(false);
  const {
    players,
    bench,
    selectedSlot,
    selectedPlayer,
    totalAge,
    averageAge,
    isBelowLimit,
    hasExpulsions,
    expelledPlayers,
    yellowCards,
    yellowCardIds,
    gkReplacementPhase,
    selectPlayer,
    cancelSelection,
    substitutePlayer,
    expelSelectedPlayer,
    giveYellowCard,
    replaceGkFromBench,
    replaceGkFromField,
    removeOutfielderForGkReplacement,
  } = useLineup({
    initialPlayers: lineup.players,
    initialBench: lineup.bench,
  });

  const {
    period,
    formatted,
    running,
    totalPeriods,
    pauseCount,
    formattedPausedTime,
    start,
    stop,
    nextPeriod,
    setPeriod,
    reset,
  } = useGameTimer();

  const color = lineup.teamColor || "#22c55e";
  const isPlayerSelected = selectedSlot !== null;

  // Handler unificado para cliques no campo — roteia conforme a fase
  const handleFieldClick = useCallback(
    (group: EmptySlot["group"], idx: number) => {
      if (gkReplacementPhase === "choose-replacement" && group !== "gk") {
        replaceGkFromField(group as "defenders" | "midfielders" | "attackers", idx);
      } else if (gkReplacementPhase === "choose-outfielder-to-remove" && group !== "gk") {
        removeOutfielderForGkReplacement(group as "defenders" | "midfielders" | "attackers", idx);
      } else if (!gkReplacementPhase) {
        selectPlayer(group, idx);
      }
    },
    [gkReplacementPhase, replaceGkFromField, removeOutfielderForGkReplacement, selectPlayer]
  );

  // Handler unificado para cliques no banco — roteia conforme a fase
  const handleBenchClick = useCallback(
    (benchIndex: number) => {
      if (gkReplacementPhase === "choose-replacement") {
        replaceGkFromBench(benchIndex);
      } else {
        substitutePlayer(benchIndex);
      }
    },
    [gkReplacementPhase, replaceGkFromBench, substitutePlayer]
  );

  const handleFinish = () => {
    if (running) stop();
    setGameFinished(true);
  };

  if (gameFinished) {
    return (
      <div className="w-full h-full flex flex-col min-h-0 overflow-y-auto justify-center">
        <GameSummary
          teamName={lineup.teamName}
          yellowCards={yellowCards}
          expelledPlayers={expelledPlayers}
          onSave={onGameSaved}
          onBack={() => setGameFinished(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0 lg:items-center overflow-y-auto lg:overflow-hidden">
      <InfoBar
        teamName={lineup.teamName}
        totalAge={totalAge}
        averageAge={averageAge}
        isBelowLimit={isBelowLimit}
        hasExpulsions={hasExpulsions}
        lineupOptions={lineupOptions}
        selectedLineupId={selectedLineupId}
        onLineupChange={onLineupChange}
        timer={{
          period,
          formatted,
          running,
          totalPeriods,
          pauseCount,
          formattedPausedTime,
          onStart: start,
          onStop: stop,
          onNextPeriod: nextPeriod,
          onSetPeriod: setPeriod,
          onReset: reset,
          onFinish: handleFinish,
        }}
      />

      <SoccerField
        players={players}
        color={color}
        yellowCardIds={yellowCardIds}
        onRemoveFromField={handleFieldClick}
        highlightFieldPlayers={gkReplacementPhase !== null}
      />

      <BenchList
        bench={bench}
        expelledPlayers={expelledPlayers}
        isPlayerSelected={isPlayerSelected}
        selectedPlayerName={selectedPlayer?.name ?? null}
        selectedPlayerHasYellow={selectedPlayer ? yellowCardIds.has(selectedPlayer.id) : false}
        onPlayerClick={handleBenchClick}
        onCancel={cancelSelection}
        onRedCard={expelSelectedPlayer}
        onYellowCard={giveYellowCard}
        gkReplacementPhase={gkReplacementPhase}
      />
    </div>
  );
}
