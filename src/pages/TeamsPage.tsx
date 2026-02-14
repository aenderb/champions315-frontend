import { useState } from "react";
import { TeamFormPopup } from "../components/team/TeamFormPopup";
import { ConfirmPopup } from "../components/ConfirmPopup";
import type { TeamFormData } from "../components/team/TeamFormPopup";
import { useData } from "../contexts/DataContext";
import type { TeamEntry } from "../contexts/DataContext";

export function TeamsPage() {
  const { teams, addTeam, updateTeam, removeTeam, getPlayersByTeam, activeTeamId, setActiveTeamId } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamEntry | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<TeamEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSave = async (data: TeamFormData) => {
    try {
      setFormError(null);
      if (editingTeam) {
        await updateTeam(editingTeam.id, data);
      } else {
        await addTeam(data);
      }
      setShowForm(false);
      setEditingTeam(null);
    } catch (err) {
      console.error("Erro ao salvar equipe:", err);
      setFormError(err instanceof Error ? err.message : "Erro ao salvar equipe");
    }
  };

  const handleEdit = (team: TeamEntry) => {
    setEditingTeam(team);
    setShowForm(true);
  };

  const handleDelete = (team: TeamEntry) => {
    setDeleteError(null);
    setDeletingTeam(team);
  };

  const handleNew = () => {
    setEditingTeam(null);
    setFormError(null);
    setShowForm(true);
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white">Equipes</h2>
        <button
          onClick={handleNew}
          className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors cursor-pointer border border-green-500/50"
        >
          + Nova Equipe
        </button>
      </div>

      {/* Lista de equipes */}
      {teams.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 max-w-md mx-auto text-center">
          <span className="text-5xl block mb-4">🏟️</span>
          <p className="text-white/50 text-sm">Nenhuma equipe cadastrada ainda.</p>
          <button
            onClick={handleNew}
            className="mt-4 text-green-400 hover:text-green-300 text-sm font-medium cursor-pointer"
          >
            Cadastrar primeira equipe
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const isActive = team.id === activeTeamId;
            return (
              <div
                key={team.id}
                className={`bg-white/5 border rounded-2xl p-4 flex flex-col gap-3 transition-colors ${
                  isActive ? "border-green-500/50 ring-1 ring-green-500/20" : "border-white/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Escudo ou cor */}
                  {team.badge ? (
                    <img
                      src={team.badge}
                      alt={team.name}
                      className="w-14 h-14 object-contain rounded-xl border border-white/10 shrink-0"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-xl border border-white/10 shrink-0"
                      style={{ backgroundColor: team.color }}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold text-sm truncate">{team.name}</h3>
                      {isActive && (
                        <span className="text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                          ATIVA
                        </span>
                      )}
                    </div>
                    {team.year && (
                      <p className="text-white/40 text-xs">Fundado em {team.year}</p>
                    )}
                    <p className="text-white/30 text-xs">{getPlayersByTeam(team.id).length} jogador(es)</p>
                    {team.sponsor && (
                      <div className="flex items-center gap-1.5 mt-1">
                        {team.sponsorLogo && (
                          <img src={team.sponsorLogo} alt="" className="w-4 h-4 object-contain" />
                        )}
                        <span className="text-white/30 text-xs truncate">{team.sponsor}</span>
                      </div>
                    )}
                  </div>

                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: team.color }}
                    title={team.color}
                  />
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-1 border-t border-white/5">
                  {!isActive && (
                    <button
                      onClick={() => setActiveTeamId(team.id)}
                      className="flex-1 py-1.5 text-xs font-semibold bg-green-600/20 hover:bg-green-600/40 text-green-300 border border-green-500/30 rounded-lg transition-colors cursor-pointer"
                    >
                      Ativar
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(team)}
                    className="flex-1 py-1.5 text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-lg transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(team)}
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
      <TeamFormPopup
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingTeam(null); setFormError(null); }}
        onSave={handleSave}
        errorMessage={formError}
        initial={editingTeam ? {
          name: editingTeam.name,
          color: editingTeam.color,
          badge: editingTeam.badge,
          year: editingTeam.year?.toString() ?? "",
          sponsor: editingTeam.sponsor ?? "",
          sponsorLogo: editingTeam.sponsorLogo,
        } : undefined}
        editMode={!!editingTeam}
      />

      {/* Popup de confirmação de exclusão */}
      <ConfirmPopup
        isOpen={!!deletingTeam}
        onClose={() => { setDeletingTeam(null); setDeleteError(null); }}
        onConfirm={async () => {
          if (!deletingTeam) return;
          setDeleting(true);
          setDeleteError(null);
          try {
            await removeTeam(deletingTeam.id);
            setDeletingTeam(null);
          } catch (err) {
            console.error("Erro ao excluir equipe:", err);
            const msg = err instanceof Error ? err.message : "";
            if (msg.toLowerCase().includes("restrict") || msg.toLowerCase().includes("foreign") || msg.toLowerCase().includes("dependen") || msg.toLowerCase().includes("referenc")) {
              setDeleteError("Não é possível excluir esta equipe. Remova primeiro todos os jogadores, escalações e partidas associados.");
            } else {
              setDeleteError(msg || "Erro ao excluir equipe. Tente novamente.");
            }
          } finally {
            setDeleting(false);
          }
        }}
        title="Excluir Equipe"
        message={`Tem certeza que deseja excluir "${deletingTeam?.name}"? A equipe só pode ser excluída se não tiver jogadores, escalações ou partidas associados.`}
        confirmLabel="Excluir"
        loading={deleting}
        errorMessage={deleteError}
      />
    </div>
  );
}
