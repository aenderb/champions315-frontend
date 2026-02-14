import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import { PopupWithForm } from "../auth/PopupWithForm";
import { useData } from "../../contexts/DataContext";
import type { TeamEntry } from "../../contexts/DataContext";
import { ALL_FIELD_ROLES } from "../../constants";
import type { FieldRole } from "../../types/api";
import { compressImage } from "../../utils/image";

export interface PlayerFormData {
  teamId: string;
  number: number;
  name: string;
  birthDate: string;
  fieldRole: FieldRole;
  avatar: string | null;
  avatarFile?: File;
}

interface PlayerFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PlayerFormData) => Promise<void> | void;
  preselectedTeamId?: string;
  initial?: Partial<PlayerFormData>;
  editMode?: boolean;
  errorMessage?: string | null;
}


export function PlayerFormPopup({ isOpen, onClose, onSave, preselectedTeamId, initial, editMode, errorMessage }: PlayerFormPopupProps) {
  const { teams, activeTeamId } = useData();

  const [teamId, setTeamId] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [fieldRole, setFieldRole] = useState<FieldRole>("ST");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Reset ao abrir — só quando isOpen muda para true
  const prevOpen = useRef(false);
  useEffect(() => {
    if (isOpen && !prevOpen.current) {
      setTeamId(initial?.teamId ?? preselectedTeamId ?? activeTeamId ?? "");
      setName(initial?.name ?? "");
      setNumber(initial?.number?.toString() ?? "");
      setBirthDate((initial?.birthDate ?? "").slice(0, 10));
      setFieldRole(initial?.fieldRole ?? "ST");
      setAvatar(initial?.avatar ?? null);
      setAvatarFile(null);
    }
    prevOpen.current = isOpen;
  }, [isOpen, initial, preselectedTeamId, activeTeamId]);

  const canSubmit =
    teamId.length > 0 &&
    name.trim().length > 0 &&
    number.length > 0 &&
    birthDate.length === 10;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      await onSave({
        teamId,
        number: parseInt(number, 10),
        name: name.trim(),
        birthDate,
        fieldRole,
        avatar,
        avatarFile: avatarFile ?? undefined,
      });
    } catch {
      // erro tratado pelo chamador
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setAvatarFile(compressed);
      setAvatar(URL.createObjectURL(compressed));
    } catch {
      // fallback: usa o arquivo original
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
    }
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
      submitLabel={saving ? "Salvando..." : editMode ? "Salvar Alterações" : "Salvar Jogador"}
      submitDisabled={!canSubmit || saving}
      errorMessage={errorMessage}
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

      {/* Data de nascimento + Função em campo */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-col gap-1 w-36 shrink-0">
          <label className="text-xs text-white/50 font-medium">Nascimento *</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={`${inputClass} [scheme:dark]`}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <label className="text-xs text-white/50 font-medium">Função em campo *</label>
          <select
            value={fieldRole}
            onChange={(e) => setFieldRole(e.target.value as FieldRole)}
            className={selectClass}
          >
            {ALL_FIELD_ROLES.map((r) => (
              <option key={r.value} value={r.value} className="bg-gray-900">
                {r.label}
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
                onClick={() => { setAvatar(null); setAvatarFile(null); if (avatarInputRef.current) avatarInputRef.current.value = ""; }}
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
