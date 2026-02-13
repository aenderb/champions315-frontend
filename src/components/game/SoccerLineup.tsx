import type { LineupData } from "../../types";
import { useState } from "react";
import { useLineup } from "../../hooks/useLineup";
import { useGameTimer } from "../../hooks/useGameTimer";
import { InfoBar } from "./InfoBar";
import { SoccerField } from "./SoccerField";
import { BenchList } from "./BenchList";
import { GameSummary } from "./GameSummary";
import type { GameResult } from "./GameSummary";

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
    expelledCount,
    yellowCards,
    yellowCardIds,
    selectPlayer,
    cancelSelection,
    substitutePlayer,
    expelSelectedPlayer,
    giveYellowCard,
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
        onRemoveFromField={selectPlayer}
      />

      <BenchList
        bench={bench}
        expelledPlayers={expelledPlayers}
        isPlayerSelected={isPlayerSelected}
        selectedPlayerName={selectedPlayer?.name ?? null}
        selectedPlayerHasYellow={selectedPlayer ? yellowCardIds.has(selectedPlayer.id) : false}
        onPlayerClick={substitutePlayer}
        onCancel={cancelSelection}
        onRedCard={expelSelectedPlayer}
        onYellowCard={giveYellowCard}
      />
    </div>
  );
}
