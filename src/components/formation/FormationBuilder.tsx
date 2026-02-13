import { useState, useMemo } from "react";
import { useData } from "../../contexts/DataContext";
import type { PlayerEntry } from "../../contexts/DataContext";
import { calcAge } from "../../utils/age";
import { AGE_LIMIT, FORMATION_SLOTS, POSITION_LABELS } from "../../constants";
import type { PlayerPosition } from "../../types/api";

interface FormationBuilderProps {
  teamId: string;
  onSave: (name: string, starterIds: string[], benchIds: string[]) => void;
  onCancel: () => void;
  /** Dados iniciais para modo edição */
  initial?: { name: string; starterIds: string[] };
  editMode?: boolean;
}

export function FormationBuilder({ teamId, onSave, onCancel, initial, editMode }: FormationBuilderProps) {
  const { getPlayersByTeam, getTeamById } = useData();
  const team = getTeamById(teamId);
  const teamPlayers = getPlayersByTeam(teamId);

  const [lineupName, setLineupName] = useState(initial?.name ?? "");
  const [starters, setStarters] = useState<(string | null)[]>(
    initial?.starterIds
      ? initial.starterIds.concat(Array(9 - initial.starterIds.length).fill(null))
      : Array(9).fill(null)
  );

  // Mapa de posição → slug para filtragem
  const slotPositions = useMemo(() => {
    const arr: PlayerPosition[] = [];
    FORMATION_SLOTS.forEach((s) => {
      for (let i = 0; i < s.count; i++) arr.push(s.group);
    });
    return arr;
  }, []);

  // IDs já escalados
  const starterIdSet = useMemo(() => new Set(starters.filter(Boolean) as string[]), [starters]);

  // Reservas = todos que não são titulares
  const benchPlayers = useMemo(
    () => teamPlayers.filter((p) => !starterIdSet.has(p.id)),
    [teamPlayers, starterIdSet]
  );

  // Soma de idades dos titulares
  const starterAges = useMemo(() => {
    return starters
      .filter(Boolean)
      .map((id) => {
        const p = teamPlayers.find((pl) => pl.id === id);
        return p ? calcAge(p.birthDate) : 0;
      });
  }, [starters, teamPlayers]);

  const totalAge = starterAges.reduce((sum, a) => sum + a, 0);
  const filledCount = starters.filter(Boolean).length;
  const isFull = filledCount === 9;
  const canSave = isFull && lineupName.trim().length > 0;

  // Jogadores disponíveis para um slot (mesma posição + não escalados)
  const availableForSlot = (slotIndex: number): PlayerEntry[] => {
    const pos = slotPositions[slotIndex];
    return teamPlayers.filter(
      (p) => p.position === pos && !starterIdSet.has(p.id)
    );
  };

  const assignPlayer = (slotIndex: number, playerId: string | null) => {
    setStarters((prev) => {
      const next = [...prev];
      next[slotIndex] = playerId;
      return next;
    });
  };

  const removeStarter = (slotIndex: number) => {
    assignPlayer(slotIndex, null);
  };

  const handleSave = () => {
    if (!canSave) return;
    const starterIds = starters.filter(Boolean) as string[];
    const benchIds = benchPlayers.map((p) => p.id);
    onSave(lineupName.trim(), starterIds, benchIds);
  };

  const getPlayer = (id: string | null) =>
    id ? teamPlayers.find((p) => p.id === id) : null;

  // Offset acumulado para mapear slot global → grupo
  let slotOffset = 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {team?.badge ? (
            <img src={team.badge} alt="" className="w-8 h-8 object-contain rounded-lg" />
          ) : (
            <div className="w-8 h-8 rounded-lg border border-white/20" style={{ backgroundColor: team?.color }} />
          )}
          <div>
            <h3 className="text-white font-bold text-sm">{team?.name}</h3>
            <p className="text-white/40 text-xs">Formação 4-3-1 · {teamPlayers.length} jogadores</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-white/40 hover:text-white/70 cursor-pointer"
        >
          ← Voltar
        </button>
      </div>

      {/* Nome da escalação */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium">Nome da escalação *</label>
        <input
          type="text"
          value={lineupName}
          onChange={(e) => setLineupName(e.target.value)}
          placeholder="Ex: Escalação principal"
          className="w-full text-sm text-white bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/50 placeholder:text-white/30"
        />
      </div>

      {/* Slots por grupo */}
      {FORMATION_SLOTS.map((group) => {
        const groupStart = slotOffset;
        slotOffset += group.count;

        return (
          <div key={group.group} className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider">
              {group.label} ({group.count})
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {Array.from({ length: group.count }, (_, i) => {
                const slotIndex = groupStart + i;
                const player = getPlayer(starters[slotIndex]);
                const available = availableForSlot(slotIndex);

                return (
                  <div
                    key={slotIndex}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3"
                  >
                    {player ? (
                      <>
                        {/* Jogador selecionado */}
                        {player.avatar ? (
                          <img src={player.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0" />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full border border-white/10 shrink-0 flex items-center justify-center text-white/50 text-xs font-bold"
                            style={{ backgroundColor: team?.color ?? "#333" }}
                          >
                            {player.number}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-white text-sm font-medium truncate block">{player.name}</span>
                          <span className="text-white/30 text-xs">#{player.number} · {calcAge(player.birthDate)} anos</span>
                        </div>
                        <button
                          onClick={() => removeStarter(slotIndex)}
                          className="w-6 h-6 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg text-xs flex items-center justify-center cursor-pointer"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Slot vazio */}
                        <div className="w-9 h-9 rounded-full border border-dashed border-white/20 shrink-0 flex items-center justify-center text-white/15 text-lg">
                          ?
                        </div>
                        {available.length > 0 ? (
                          <select
                            value=""
                            onChange={(e) => assignPlayer(slotIndex, e.target.value)}
                            className="flex-1 text-xs text-white bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-400/50 appearance-none cursor-pointer"
                          >
                            <option value="" className="bg-gray-900">Selecionar {POSITION_LABELS[group.group]}...</option>
                            {available.map((p) => (
                              <option key={p.id} value={p.id} className="bg-gray-900">
                                #{p.number} {p.name} ({calcAge(p.birthDate)}a)
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-white/20 italic">
                            Sem {POSITION_LABELS[group.group].toLowerCase()} disponível
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Resumo de idades */}
      {filledCount > 0 && (
        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium ${
          isFull && totalAge < AGE_LIMIT
            ? "bg-red-500/10 border border-red-500/30 text-red-300"
            : isFull && totalAge >= AGE_LIMIT
              ? "bg-green-500/10 border border-green-500/30 text-green-300"
              : "bg-white/5 border border-white/10 text-white/50"
        }`}>
          <span>Titulares: {filledCount}/9</span>
          <span>·</span>
          <span>Soma de idades: {totalAge}{isFull ? ` / ${AGE_LIMIT}` : ""}</span>
          {isFull && totalAge < AGE_LIMIT && <span>⚠️ Abaixo do mínimo!</span>}
        </div>
      )}

      {/* Reservas */}
      {benchPlayers.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider">
            Reservas ({benchPlayers.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {benchPlayers.map((p) => (
              <div
                key={p.id}
                className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-xs text-white/50"
              >
                <span className="font-mono text-white/30">#{p.number}</span>
                <span>{p.name}</span>
                <span className="text-white/20">{POSITION_LABELS[p.position]?.slice(0, 3) ?? p.position}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm text-white/50 hover:text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer border ${
            canSave
              ? "bg-green-600 hover:bg-green-500 text-white border-green-500/50"
              : "bg-gray-700 text-gray-400 border-gray-600/50 cursor-not-allowed"
          }`}
        >
          {editMode ? "Salvar Alterações" : "Salvar Escalação"}
        </button>
      </div>
    </div>
  );
}
