import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import { PopupWithForm } from "../auth/PopupWithForm";
import { useData } from "../../contexts/DataContext";
import type { TeamEntry } from "../../contexts/DataContext";

export interface PlayerFormData {
  teamId: string;
  number: number;
  name: string;
  birthDate: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  avatar: string | null;
}

interface PlayerFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PlayerFormData) => void;
  preselectedTeamId?: string;
  initial?: Partial<PlayerFormData>;
  editMode?: boolean;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const POSITIONS = [
  { value: "GK", label: "Goleiro" },
  { value: "DEF", label: "Defensor" },
  { value: "MID", label: "Meio-campo" },
  { value: "FWD", label: "Atacante" },
] as const;

export function PlayerFormPopup({ isOpen, onClose, onSave, preselectedTeamId, initial, editMode }: PlayerFormPopupProps) {
  const { teams, activeTeamId } = useData();

  const [teamId, setTeamId] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [position, setPosition] = useState<"GK" | "DEF" | "MID" | "FWD">("DEF");
  const [avatar, setAvatar] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Reset ao abrir
  useEffect(() => {
    if (isOpen) {
      setTeamId(initial?.teamId ?? preselectedTeamId ?? activeTeamId ?? "");
      setName(initial?.name ?? "");
      setNumber(initial?.number?.toString() ?? "");
      setBirthDate(initial?.birthDate ?? "");
      setPosition(initial?.position ?? "DEF");
      setAvatar(initial?.avatar ?? null);
    }
  }, [isOpen, initial, preselectedTeamId, activeTeamId]);

  const canSubmit =
    teamId.length > 0 &&
    name.trim().length > 0 &&
    number.length > 0 &&
    birthDate.length === 10;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSave({
      teamId,
      number: parseInt(number, 10),
      name: name.trim(),
      birthDate,
      position,
      avatar,
    });
  };

  const handleAvatarUpload = async (file: File | undefined) => {
    if (!file) return;
    const base64 = await fileToBase64(file);
    setAvatar(base64);
  };

  const inputClass =
    "w-full text-sm text-white bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/50 placeholder:text-white/30";

  const selectClass =
    "w-full text-sm text-white bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/50 appearance-none cursor-pointer";

  return (
    <PopupWithForm
      title={editMode ? "Editar Jogador" : "Cadastrar Jogador"}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={editMode ? "Salvar Alterações" : "Salvar Jogador"}
      submitDisabled={!canSubmit}
    >
      {/* Equipe */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium">Equipe *</label>
        {teams.length === 0 ? (
          <p className="text-xs text-yellow-400/80">Cadastre uma equipe primeiro.</p>
        ) : editMode ? (
          <input
            type="text"
            value={teams.find((t) => t.id === teamId)?.name ?? ""}
            disabled
            className={`${selectClass} opacity-50`}
          />
        ) : (
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className={selectClass}
          >
            <option value="" className="bg-gray-900">Selecione...</option>
            {teams.map((t: TeamEntry) => (
              <option key={t.id} value={t.id} className="bg-gray-900">
                {t.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Nome + Número (lado a lado) */}
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-white/50 font-medium">Nome completo *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do jogador"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1 w-20">
          <label className="text-xs text-white/50 font-medium">Nº *</label>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 3))}
            placeholder="10"
            inputMode="numeric"
            className={inputClass}
          />
        </div>
      </div>

      {/* Data de nascimento + Posição */}
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-white/50 font-medium">Data de nascimento *</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-white/50 font-medium">Posição</label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as PlayerFormData["position"])}
            className={selectClass}
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value} className="bg-gray-900">
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Foto */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium">Foto</label>
        <div className="flex items-center gap-3">
          {avatar ? (
            <div className="relative w-12 h-12 shrink-0">
              <img src={avatar} alt="Foto" className="w-full h-full object-cover rounded-full border border-white/20" />
              <button
                type="button"
                onClick={() => { setAvatar(null); if (avatarInputRef.current) avatarInputRef.current.value = ""; }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/20 text-lg shrink-0">
              👤
            </div>
          )}
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="text-xs text-green-400 hover:text-green-300 font-medium cursor-pointer"
          >
            {avatar ? "Trocar foto" : "Enviar foto"}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
          />
        </div>
      </div>
    </PopupWithForm>
  );
}
