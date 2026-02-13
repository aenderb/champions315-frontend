import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { FormationBuilder } from "../components/formation/FormationBuilder";
import { ConfirmPopup } from "../components/ConfirmPopup";
import { calcAge } from "../utils/age";
import type { LineupEntry } from "../contexts/DataContext";

export function FormationsPage() {
  const { activeTeam, activeTeamId, activeTeamPlayers, activeTeamLineups, addLineup, updateLineup, removeLineup } = useData();
  const [building, setBuilding] = useState(false);
  const [editingLineup, setEditingLineup] = useState<LineupEntry | null>(null);
  const [deletingLineup, setDeletingLineup] = useState<LineupEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (name: string, starterIds: string[], benchIds: string[]) => {
    if (!activeTeamId) return;
    try {
      if (editingLineup) {
        await updateLineup(editingLineup.id, { name, starterIds, benchIds });
      } else {
        await addLineup({ teamId: activeTeamId, name, starterIds, benchIds });
      }
      setBuilding(false);
      setEditingLineup(null);
    } catch (err) {
      console.error("Erro ao salvar escalação:", err);
      alert(err instanceof Error ? err.message : "Erro ao salvar escalação");
    }
  };

  const getPlayerName = (id: string) => {
    const p = activeTeamPlayers.find((pl) => pl.id === id);
    return p ? `#${p.number} ${p.name}` : id;
  };

  const getLineupAgeSum = (starterIds: string[]) => {
    return starterIds.reduce((sum, id) => {
      const p = activeTeamPlayers.find((pl) => pl.id === id);
      return sum + (p ? calcAge(p.birthDate) : 0);
    }, 0);
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

  // Montando escalação
  if (building) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-auto">
        <FormationBuilder
          teamId={activeTeamId}
          onSave={handleSave}
          onCancel={() => { setBuilding(false); setEditingLineup(null); }}
          initial={editingLineup ? { name: editingLineup.name, starterIds: editingLineup.starterIds } : undefined}
          editMode={!!editingLineup}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Formações</h2>
          <p className="text-xs text-white/40">{activeTeam.name} · {activeTeamLineups.length} escalação(ões)</p>
        </div>
        <button
          onClick={() => setBuilding(true)}
          disabled={activeTeamPlayers.length < 9}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer border whitespace-nowrap ${
            activeTeamPlayers.length >= 9
              ? "bg-green-600 hover:bg-green-500 text-white border-green-500/50"
              : "bg-gray-700 text-gray-400 border-gray-600/50 cursor-not-allowed"
          }`}
        >
          + Nova Escalação
        </button>
      </div>

      {/* Conteúdo */}
      {activeTeamPlayers.length < 9 ? (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 max-w-md mx-auto text-center">
          <span className="text-4xl block mb-3">⚠️</span>
          <p className="text-yellow-300 text-sm font-medium">
            A equipe precisa de pelo menos 9 jogadores para montar uma escalação.
          </p>
          <p className="text-yellow-300/50 text-xs mt-1">
            Atualmente: {activeTeamPlayers.length} jogador(es) cadastrado(s).
          </p>
        </div>
      ) : activeTeamLineups.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 max-w-md mx-auto text-center">
          <span className="text-5xl block mb-4">📋</span>
          <p className="text-white/50 text-sm">Nenhuma escalação criada para {activeTeam.name}.</p>
          <button
            onClick={() => setBuilding(true)}
            className="mt-4 text-green-400 hover:text-green-300 text-sm font-medium cursor-pointer"
          >
            Criar primeira escalação
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeTeamLineups.map((lineup) => {
            const ageSum = getLineupAgeSum(lineup.starterIds);
            return (
              <div
                key={lineup.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3"
              >
                <h3 className="text-white font-bold text-sm">{lineup.name}</h3>

                {/* Titulares */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Titulares ({lineup.starterIds.length})</span>
                  <div className="flex flex-wrap gap-1">
                    {lineup.starterIds.map((id) => (
                      <span
                        key={id}
                        className="text-[10px] text-white/60 bg-white/5 px-1.5 py-0.5 rounded"
                      >
                        {getPlayerName(id)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Reservas */}
                {lineup.benchIds.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Reservas ({lineup.benchIds.length})</span>
                    <div className="flex flex-wrap gap-1">
                      {lineup.benchIds.map((id) => (
                        <span
                          key={id}
                          className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded"
                        >
                          {getPlayerName(id)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Soma de idades */}
                <div className={`text-xs font-medium px-2 py-1 rounded-lg text-center ${
                  ageSum >= 315
                    ? "bg-green-500/10 text-green-300"
                    : "bg-red-500/10 text-red-300"
                }`}>
                  Σ Idades: {ageSum}
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-1 border-t border-white/5">
                  <button
                    onClick={() => {
                      setEditingLineup(lineup);
                      setBuilding(true);
                    }}
                    className="flex-1 py-1.5 text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-lg transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeletingLineup(lineup)}
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

      {/* Popup de confirmação de exclusão */}
      <ConfirmPopup
        isOpen={!!deletingLineup}
        onClose={() => setDeletingLineup(null)}
        onConfirm={async () => {
          if (!deletingLineup) return;
          setDeleting(true);
          try {
            await removeLineup(deletingLineup.id);
            setDeletingLineup(null);
          } catch (err) {
            console.error("Erro ao excluir escalação:", err);
          } finally {
            setDeleting(false);
          }
        }}
        title="Excluir Escalação"
        message={`Tem certeza que deseja excluir "${deletingLineup?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleting}
      />
    </div>
  );
}
