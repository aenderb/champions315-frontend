import { useState, useMemo, useCallback } from "react";
import SoccerLineup from "../components/game/SoccerLineup";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useData } from "../contexts/DataContext";
import { toLineupDataFromIds } from "../api/mappers";
import type { ApiTeam, ApiPlayer, ApiMatchCreate } from "../types/api";
import type { GameResult } from "../components/game/GameSummary";
import { useNavigate } from "react-router-dom";

export function GamePage() {
  const navigate = useNavigate();
  const { activeTeam, activeTeamPlayers, activeTeamLineups, addMatch } = useData();
  const [selectedLineupId, setSelectedLineupId] = useState<string | null>(null);
  const [savedGame, setSavedGame] = useState<GameResult | null>(null);

  // Auto-selecionar primeira escalação
  const currentLineupId = selectedLineupId ?? activeTeamLineups[0]?.id ?? null;

  const lineupOptions = useMemo(
    () => activeTeamLineups.map((l) => ({ id: l.id, name: l.name })),
    [activeTeamLineups]
  );

  const lineup = useMemo(() => {
    if (!currentLineupId || !activeTeam) return null;
    const entry = activeTeamLineups.find((l) => l.id === currentLineupId);
    if (!entry) return null;
    return toLineupDataFromIds(
      { formation: "4-3-1", starterIds: entry.starterIds, benchIds: entry.benchIds },
      activeTeamPlayers as ApiPlayer[],
      activeTeam as unknown as ApiTeam
    );
  }, [currentLineupId, activeTeam, activeTeamLineups, activeTeamPlayers]);

  const handleGameSaved = useCallback(async (result: GameResult) => {
    if (!activeTeam) return;

    // Mapeia cartões amarelos + vermelhos (expulsos) para o formato da API
    const cards: ApiMatchCreate["cards"] = [
      ...result.yellowCards.map((c) => ({
        playerId: c.playerId,
        type: "YELLOW" as const,
      })),
      ...result.expelledPlayers.map((p) => ({
        playerId: p.playerId,
        type: "RED" as const,
      })),
    ];

    const matchData: ApiMatchCreate = {
      opponentName: result.opponentName,
      teamScore: result.scoreHome,
      opponentScore: result.scoreAway,
      date: result.gameDate,
      cards,
    };

    try {
      await addMatch(activeTeam.id, matchData);
      setSavedGame(result);
    } catch (err) {
      console.error("Erro ao salvar partida:", err);
      alert("Erro ao salvar a partida. Tente novamente.");
    }
  }, [activeTeam, addMatch]);

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
                {activeTeam?.name} {savedGame.scoreHome} × {savedGame.scoreAway} {savedGame.opponentName}
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
        ) : !lineup ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white/50">
              <p className="text-lg mb-2">Nenhuma escalação disponível</p>
              <p className="text-sm">Crie uma escalação na página de Formações para iniciar um jogo.</p>
            </div>
          </div>
        ) : (
          <SoccerLineup
            key={currentLineupId}
            lineup={lineup}
            lineupOptions={lineupOptions}
            selectedLineupId={currentLineupId!}
            onLineupChange={setSelectedLineupId}
            onGameSaved={handleGameSaved}
          />
        )}
      </ErrorBoundary>
    </main>
  );
}
