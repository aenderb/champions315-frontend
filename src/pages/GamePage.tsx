import { useState, useMemo, useCallback } from "react";
import SoccerLineup from "../components/game/SoccerLineup";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { mockLineups, mockPlayers, mockTeam } from "../mocks";
import { toLineupData } from "../api/mappers";
import type { GameResult } from "../components/game/GameSummary";
import { useNavigate } from "react-router-dom";

const lineupOptions = mockLineups.map((l) => ({ id: l.id, name: l.name }));

export function GamePage() {
  const navigate = useNavigate();
  const [selectedLineupId, setSelectedLineupId] = useState(mockLineups[0].id);
  const [savedGame, setSavedGame] = useState<GameResult | null>(null);

  const lineup = useMemo(() => {
    const apiLineup = mockLineups.find((l) => l.id === selectedLineupId) ?? mockLineups[0];
    return toLineupData(apiLineup, mockPlayers, mockTeam);
  }, [selectedLineupId]);

  const handleGameSaved = useCallback((result: GameResult) => {
    console.log("Jogo salvo:", result);
    setSavedGame(result);
  }, []);

  const handleNewGame = useCallback(() => {
    setSavedGame(null);
  }, []);

  return (
    <main className="flex-1 min-h-0 flex flex-col p-2 md:p-4 lg:px-6 lg:py-2">
      <ErrorBoundary>
        {savedGame ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
            <div className="bg-green-500/15 border border-green-500/40 rounded-2xl p-6 md:p-8 max-w-md w-full text-center">
              <span className="text-4xl mb-3 block">✅</span>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Jogo Salvo!</h2>
              <p className="text-white/70 text-sm md:text-base mb-1">
                {lineup.teamName} {savedGame.scoreHome} × {savedGame.scoreAway} {savedGame.opponentName}
              </p>
              {savedGame.expelledPlayers.length > 0 && (
                <p className="text-red-300 text-xs md:text-sm mt-2 text-left">
                  <span className="inline-block w-2.5 h-3 bg-red-600 rounded-sm mr-1 align-middle"></span>
                  <span className="font-semibold">Cartões Vermelhos:</span>{" "}
                  {savedGame.expelledPlayers.map((p) => `${p.playerName} (#${p.playerNumber})`).join(", ")}
                </p>
              )}
              {savedGame.yellowCards.length > 0 && (
                <p className="text-yellow-300 text-xs md:text-sm mt-1 text-left">
                  <span className="inline-block w-2.5 h-3 bg-yellow-400 rounded-sm mr-1 align-middle"></span>
                  <span className="font-semibold">Cartões Amarelos:</span>{" "}
                  {savedGame.yellowCards.map((c) => `${c.playerName} (#${c.playerNumber})`).join(", ")}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNewGame}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors cursor-pointer border border-green-500/50"
              >
                Novo Jogo
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors cursor-pointer border border-white/20"
              >
                Início
              </button>
            </div>
          </div>
        ) : (
          <SoccerLineup
            key={selectedLineupId}
            lineup={lineup}
            lineupOptions={lineupOptions}
            selectedLineupId={selectedLineupId}
            onLineupChange={setSelectedLineupId}
            onGameSaved={handleGameSaved}
          />
        )}
      </ErrorBoundary>
    </main>
  );
}
