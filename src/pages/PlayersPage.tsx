import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { PlayerFormPopup } from "../components/player/PlayerFormPopup";
import { ConfirmPopup } from "../components/ConfirmPopup";
import type { PlayerFormData } from "../components/player/PlayerFormPopup";
import type { PlayerEntry } from "../contexts/DataContext";
import { calcAge } from "../utils/age";
import { FIELD_ROLE_SHORT } from "../constants";

export function PlayersPage() {
  const { activeTeam, activeTeamId, activeTeamPlayers, addPlayer, updatePlayer, removePlayer } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerEntry | null>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<PlayerEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (data: PlayerFormData) => {
    try {
      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, data);
      } else {
        await addPlayer(data);
      }
      setShowForm(false);
      setEditingPlayer(null);
    } catch (err) {
      console.error("Erro ao salvar jogador:", err);
      alert(err instanceof Error ? err.message : "Erro ao salvar jogador");
    }
  };

  const handleEdit = (player: PlayerEntry) => {
    setEditingPlayer(player);
    setShowForm(true);
  };

  const handleDelete = (player: PlayerEntry) => {
    setDeletingPlayer(player);
  };

  const handleNew = () => {
    setEditingPlayer(null);
    setShowForm(true);
  };

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

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Jogadores</h2>
          <p className="text-xs text-white/40">{activeTeam.name} · {activeTeamPlayers.length} jogador(es)</p>
        </div>
        <button
          onClick={handleNew}
          className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors cursor-pointer border border-green-500/50 whitespace-nowrap"
        >
          + Novo Jogador
        </button>
      </div>

      {/* Lista */}
      {activeTeamPlayers.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 max-w-md mx-auto text-center">
          <span className="text-5xl block mb-4">👤</span>
          <p className="text-white/50 text-sm">Nenhum jogador cadastrado para {activeTeam.name}.</p>
          <button
            onClick={handleNew}
            className="mt-4 text-green-400 hover:text-green-300 text-sm font-medium cursor-pointer"
          >
            Cadastrar primeiro jogador
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activeTeamPlayers.map((player) => {
            const age = calcAge(player.birthDate);
            return (
              <div
                key={player.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-2"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  {player.avatar ? (
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-11 h-11 object-cover rounded-full border border-white/10 shrink-0"
                    />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-full border border-white/10 shrink-0 flex items-center justify-center text-white/30 text-sm font-bold"
                      style={{ backgroundColor: activeTeam.color }}
                    >
                      {player.number}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-bold text-sm truncate">{player.name}</span>
                      <span className="text-[10px] text-white/30 font-mono">#{player.number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span>{player.fieldRole ? (FIELD_ROLE_SHORT[player.fieldRole] ?? player.fieldRole) : player.position}</span>
                      <span>·</span>
                      <span>{age} anos</span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-1 border-t border-white/5">
                  <button
                    onClick={() => handleEdit(player)}
                    className="flex-1 py-1.5 text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-lg transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(player)}
                    className="py-1.5 px-3 text-xs font-semibold bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 rounded-lg transition-colors cursor-pointer"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Popup form */}
      <PlayerFormPopup
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingPlayer(null); }}
        onSave={handleSave}
        preselectedTeamId={activeTeamId}
        initial={editingPlayer ? {
          teamId: editingPlayer.teamId,
          number: editingPlayer.number,
          name: editingPlayer.name,
          birthDate: editingPlayer.birthDate.slice(0, 10),
          fieldRole: editingPlayer.fieldRole ?? undefined,
          avatar: editingPlayer.avatar,
        } : undefined}
        editMode={!!editingPlayer}
      />

      {/* Popup de confirmação de exclusão */}
      <ConfirmPopup
        isOpen={!!deletingPlayer}
        onClose={() => setDeletingPlayer(null)}
        onConfirm={async () => {
          if (!deletingPlayer) return;
          setDeleting(true);
          try {
            await removePlayer(deletingPlayer.id);
            setDeletingPlayer(null);
          } catch (err) {
            console.error("Erro ao excluir jogador:", err);
          } finally {
            setDeleting(false);
          }
        }}
        title="Excluir Jogador"
        message={`Tem certeza que deseja excluir "${deletingPlayer?.name}"? O jogador será removido das escalações.`}
        confirmLabel="Excluir"
        loading={deleting}
      />
    </div>
  );
}
