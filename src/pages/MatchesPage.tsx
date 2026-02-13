import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { ConfirmPopup } from "../components/ConfirmPopup";
import type { MatchEntry } from "../contexts/DataContext";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  // Se já é ISO completo (contém T), usa direto; senão adiciona horário para evitar fuso
  const d = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function MatchesPage() {
  const { activeTeam, activeTeamId, activeTeamMatches, removeMatch, players } = useData();
  const [deletingMatch, setDeletingMatch] = useState<MatchEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Sem equipe ativa
  if (!activeTeamId || !activeTeam) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 max-w-md text-center">
          <span className="text-4xl block mb-3">⚠️</span>
          <p className="text-yellow-300 text-sm font-medium">Nenhuma equipe ativa.</p>
          <p className="text-yellow-300/50 text-xs mt-1">Vá em Equipes e ative uma equipe primeiro.</p>
        </div>
      </div>
    );
  }

  // Ordena partidas por data descrescente (mais recente primeiro)
  const sorted = [...activeTeamMatches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Estatísticas rápidas
  const wins = sorted.filter((m) => m.teamScore > m.opponentScore).length;
  const draws = sorted.filter((m) => m.teamScore === m.opponentScore).length;
  const losses = sorted.filter((m) => m.teamScore < m.opponentScore).length;

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Partidas</h2>
          <p className="text-xs text-white/40">
            {activeTeam.name} · {sorted.length} partida(s)
            {sorted.length > 0 && (
              <span className="ml-2">
                — {wins}V {draws}E {losses}D
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Lista */}
      {sorted.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 max-w-md mx-auto text-center">
          <span className="text-5xl block mb-4">⚽</span>
          <p className="text-white/50 text-sm">Nenhuma partida registrada para {activeTeam.name}.</p>
          <p className="text-white/30 text-xs mt-2">Finalize um jogo para que ele apareça aqui.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((match) => {
            const isWin = match.teamScore > match.opponentScore;
            const isDraw = match.teamScore === match.opponentScore;
            const resultColor = isWin
              ? "text-green-400"
              : isDraw
                ? "text-yellow-400"
                : "text-red-400";
            const resultBg = isWin
              ? "bg-green-500/10 border-green-500/20"
              : isDraw
                ? "bg-yellow-500/10 border-yellow-500/20"
                : "bg-red-500/10 border-red-500/20";
            const resultLabel = isWin ? "V" : isDraw ? "E" : "D";

            const yellowCards = match.cards?.filter((c) => c.type === "YELLOW") ?? [];
            const redCards = match.cards?.filter((c) => c.type === "RED") ?? [];

            return (
              <div
                key={match.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-2"
              >
                {/* Placar */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{activeTeam.name}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${resultBg}`}>
                    <span className="text-white font-bold text-lg tabular-nums">{match.teamScore}</span>
                    <span className="text-white/30 text-sm">×</span>
                    <span className="text-white font-bold text-lg tabular-nums">{match.opponentScore}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-white font-bold text-sm truncate">{match.opponentName}</p>
                  </div>
                </div>

                {/* Resultado + Data */}
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span className={`font-bold ${resultColor}`}>{resultLabel}</span>
                  <span>{formatDate(match.date || match.createdAt)}</span>
                </div>

                {/* Cartões */}
                {(yellowCards.length > 0 || redCards.length > 0) && (
                  <div className="flex flex-col gap-1.5 text-xs text-white/40 pt-1 border-t border-white/5">
                    {yellowCards.length > 0 && (
                      <div className="flex items-start gap-1.5">
                        <span className="inline-block w-2.5 h-3 bg-yellow-400 rounded-sm shrink-0 mt-0.5"></span>
                        <span className="leading-snug">
                          {yellowCards.map((c) => {
                            const p = c.player ?? players.find((pl) => pl.id === c.playerId);
                            return p?.name ?? `#${c.playerId.slice(0, 6)}`;
                          }).join(", ")}
                        </span>
                      </div>
                    )}
                    {redCards.length > 0 && (
                      <div className="flex items-start gap-1.5">
                        <span className="inline-block w-2.5 h-3 bg-red-600 rounded-sm shrink-0 mt-0.5"></span>
                        <span className="leading-snug">
                          {redCards.map((c) => {
                            const p = c.player ?? players.find((pl) => pl.id === c.playerId);
                            return p?.name ?? `#${c.playerId.slice(0, 6)}`;
                          }).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-1 border-t border-white/5">
                  <button
                    onClick={() => setDeletingMatch(match)}
                    className="flex-1 py-1.5 text-xs font-semibold bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 rounded-lg transition-colors cursor-pointer"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Popup de confirmação de exclusão */}
      <ConfirmPopup
        isOpen={!!deletingMatch}
        onClose={() => setDeletingMatch(null)}
        onConfirm={async () => {
          if (!deletingMatch || !activeTeamId) return;
          setDeleting(true);
          try {
            await removeMatch(activeTeamId, deletingMatch.id);
            setDeletingMatch(null);
          } catch (err) {
            console.error("Erro ao excluir partida:", err);
          } finally {
            setDeleting(false);
          }
        }}
        title="Excluir Partida"
        message={`Tem certeza que deseja excluir a partida contra "${deletingMatch?.opponentName}"?`}
        confirmLabel="Excluir"
        loading={deleting}
      />
    </div>
  );
}
