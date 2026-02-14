import type { LineupData } from "../../types";
import { useState, useCallback } from "react";
import { useLineup } from "../../hooks/useLineup";
import { useGameTimer } from "../../hooks/useGameTimer";
import { AGE_LIMIT } from "../../constants";
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
        sponsorLogo={lineup.sponsorLogo}
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
        dimmed={isBelowLimit}
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

      {/* Popup de confirmação de substituição abaixo de 315 */}
      {pendingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-red-500/50 rounded-2xl p-5 mx-4 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-red-400 font-bold text-base">Atenção!</h3>
            </div>
            <p className="text-white/80 text-sm font-medium mb-1">
              Esta substituição fará a soma das idades cair para{" "}
              <span className="text-red-400 font-bold">{pendingSub.newTotalAge}</span>,
              abaixo do mínimo de <span className="font-bold">{AGE_LIMIT}</span>.
            </p>
            <p className="text-white/60 text-sm mb-5">Deseja manter a substituição?</p>
            <div className="flex gap-3">
              <button
                onClick={cancelPendingSub}
                className="flex-1 py-2.5 text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-colors cursor-pointer"
              >
                Não
              </button>
              <button
                onClick={confirmPendingSub}
                className="flex-1 py-2.5 text-sm font-semibold bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 rounded-xl transition-colors cursor-pointer"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
