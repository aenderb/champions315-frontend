import { useState } from "react";
import type { Player } from "../../types";
import type { YellowCard } from "../../hooks/useLineup";

export interface GameResult {
  opponentName: string;
  gameDate: string;
  scoreHome: number;
  scoreAway: number;
  yellowCards: YellowCard[];
  expelledPlayers: { playerId: string; playerNumber: number; playerName: string }[];
}

interface GameSummaryProps {
  teamName: string;
  yellowCards: YellowCard[];
  expelledPlayers: Player[];
  onSave: (result: GameResult) => void;
  onBack: () => void;
}

export function GameSummary({
  teamName,
  yellowCards,
  expelledPlayers,
  onSave,
  onBack,
}: GameSummaryProps) {
  const today = new Date().toISOString().split("T")[0];

  const [opponentName, setOpponentName] = useState("");
  const [scoreHome, setScoreHome] = useState(0);
  const [scoreAway, setScoreAway] = useState(0);

  const canSave = opponentName.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      opponentName: opponentName.trim(),
      gameDate: today,
      scoreHome,
      scoreAway,
      yellowCards,
      expelledPlayers: expelledPlayers.map((p) => ({
        playerId: p.id,
        playerNumber: p.number,
        playerName: p.name,
      })),
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4 md:gap-6 p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold text-white text-center">
        ⚽ Finalizar Jogo
      </h2>

      {/* Resultado */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
        <h3 className="text-sm font-semibold text-white/70 mb-3">Resultado</h3>
        <div className="flex items-end justify-center gap-3 md:gap-4">
          {/* Time da casa */}
          <div className="flex flex-col items-center gap-2">
            <input
              type="text"
              value={teamName}
              disabled
              className="w-36 md:w-44 text-center text-xs md:text-sm text-white/50 bg-white/5 border border-white/10 rounded-lg px-2 py-1 cursor-not-allowed"
            />
            <input
              type="number"
              min={0}
              max={99}
              value={scoreHome}
              onChange={(e) => setScoreHome(Math.max(0, Number(e.target.value)))}
              className="w-16 md:w-20 text-center text-2xl md:text-3xl font-bold text-white bg-white/10 border border-white/20 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-green-400/50"
            />
          </div>

          <span className="text-white/40 text-2xl font-bold pb-2.5">×</span>

          {/* Adversário */}
          <div className="flex flex-col items-center gap-2">
            <input
              type="text"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              placeholder="Adversário"
              className="w-36 md:w-44 text-center text-xs md:text-sm text-white bg-white/10 border border-white/20 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400/50 placeholder:text-white/30"
            />
            <input
              type="number"
              min={0}
              max={99}
              value={scoreAway}
              onChange={(e) => setScoreAway(Math.max(0, Number(e.target.value)))}
              className="w-16 md:w-20 text-center text-2xl md:text-3xl font-bold text-white bg-white/10 border border-white/20 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-green-400/50"
            />
          </div>
        </div>
      </div>

      {/* Cartões */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white/70 mb-3">Cartões do Jogo</h3>
        {yellowCards.length === 0 && expelledPlayers.length === 0 ? (
          <p className="text-white/40 text-xs md:text-sm italic">Nenhum cartão nesse jogo</p>
        ) : (
          <div className="flex flex-col gap-2">
            {expelledPlayers.length > 0 && (
              <p className="text-red-300 text-xs md:text-sm">
                <span className="inline-block w-2.5 h-3 bg-red-600 rounded-sm mr-1 align-middle"></span>
                <span className="font-semibold">Cartões Vermelhos:</span>{" "}
                {expelledPlayers.map((p) => `${p.name} (#${p.number})`).join(", ")}
              </p>
            )}
            {yellowCards.length > 0 && (
              <p className="text-yellow-300 text-xs md:text-sm">
                <span className="inline-block w-2.5 h-3 bg-yellow-400 rounded-sm mr-1 align-middle"></span>
                <span className="font-semibold">Cartões Amarelos:</span>{" "}
                {yellowCards.map((c) => `${c.playerName} (#${c.playerNumber})`).join(", ")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer border border-white/20"
        >
          ← Voltar
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`flex-1 py-3 rounded-xl font-semibold transition-colors cursor-pointer border ${
            canSave
              ? "bg-green-600 hover:bg-green-500 text-white border-green-500/50"
              : "bg-gray-700 text-gray-400 border-gray-600/50 cursor-not-allowed"
          }`}
        >
          Salvar Jogo
        </button>
      </div>
    </div>
  );
}
