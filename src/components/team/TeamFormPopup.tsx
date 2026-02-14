import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import { PopupWithForm } from "../auth/PopupWithForm";
import { compressImage } from "../../utils/image";

export interface TeamFormData {
  name: string;
  color: string;
  badge: string | null;
  badgeFile?: File;
  year: string;
  sponsor: string;
  sponsorLogo: string | null;
  sponsorLogoFile?: File;
}

interface TeamFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TeamFormData) => Promise<void> | void;
  initial?: Partial<TeamFormData>;
  editMode?: boolean;
  errorMessage?: string | null;
}

export function TeamFormPopup({ isOpen, onClose, onSave, initial, editMode, errorMessage }: TeamFormPopupProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [badge, setBadge] = useState<string | null>(null);
  const [badgeFile, setBadgeFile] = useState<File | null>(null);
  const [year, setYear] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [sponsorLogo, setSponsorLogo] = useState<string | null>(null);
  const [sponsorLogoFile, setSponsorLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const badgeInputRef = useRef<HTMLInputElement>(null);
  const sponsorLogoInputRef = useRef<HTMLInputElement>(null);

  // Reset ao abrir — só quando isOpen muda para true
  const prevOpen = useRef(false);
  useEffect(() => {
    if (isOpen && !prevOpen.current) {
      setName(initial?.name ?? "");
      setColor(initial?.color ?? "#ffffff");
      setBadge(initial?.badge ?? null);
      setBadgeFile(null);
      setYear(initial?.year ?? "");
      setSponsor(initial?.sponsor ?? "");
      setSponsorLogo(initial?.sponsorLogo ?? null);
      setSponsorLogoFile(null);
    }
    prevOpen.current = isOpen;
  }, [isOpen, initial]);

  const canSubmit = name.trim().length > 0;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        color,
        badge,
        badgeFile: badgeFile ?? undefined,
        year,
        sponsor: sponsor.trim(),
        sponsorLogo,
        sponsorLogoFile: sponsorLogoFile ?? undefined,
      });
    } catch {
      // erro tratado pelo chamador
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (
    file: File | undefined,
    previewSetter: (val: string | null) => void,
    fileSetter: (val: File | null) => void
  ) => {
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      fileSetter(compressed);
      previewSetter(URL.createObjectURL(compressed));
    } catch {
      fileSetter(file);
      previewSetter(URL.createObjectURL(file));
    }
  };

  const inputClass =
    "w-full text-sm text-white bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/50 placeholder:text-white/30";

  return (
    <PopupWithForm
      title={editMode ? "Editar Equipe" : "Cadastrar Equipe"}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={saving ? "Salvando..." : editMode ? "Salvar Alterações" : "Salvar Equipe"}
      submitDisabled={!canSubmit || saving}
      errorMessage={errorMessage}
    >
      {/* Nome */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium">Nome da equipe <span className="text-red-400">*</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Esquadrão Veteranos"
          autoFocus
          className={inputClass}
        />
      </div>

      {/* Cor + Ano (lado a lado) */}
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-white/50 font-medium">Cor da camisa</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer shrink-0"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={inputClass}
              maxLength={7}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 w-28">
          <label className="text-xs text-white/50 font-medium">Ano de fundação</label>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="2020"
            className={inputClass}
            inputMode="numeric"
          />
        </div>
      </div>

      {/* Escudo */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium">Escudo</label>
        <div className="flex items-center gap-3">
          {badge ? (
            <div className="relative w-12 h-12 shrink-0">
              <img src={badge} alt="Escudo" className="w-full h-full object-contain rounded-lg border border-white/20" />
              <button
                type="button"
                onClick={() => { setBadge(null); setBadgeFile(null); if (badgeInputRef.current) badgeInputRef.current.value = ""; }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-white/20 text-lg shrink-0">
              🛡️
            </div>
          )}
          <button
            type="button"
            onClick={() => badgeInputRef.current?.click()}
            className="text-xs text-green-400 hover:text-green-300 font-medium cursor-pointer"
          >
            {badge ? "Trocar imagem" : "Enviar imagem"}
          </button>
          <input
            ref={badgeInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files?.[0], setBadge, setBadgeFile)}
          />
        </div>
      </div>

      {/* Patrocinador */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium">Patrocinador</label>
        <input
          type="text"
          value={sponsor}
          onChange={(e) => setSponsor(e.target.value)}
          placeholder="Nome do patrocinador"
          className={inputClass}
        />
      </div>

      {/* Logo do patrocinador */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium">Logo do patrocinador</label>
        <div className="flex items-center gap-3">
          {sponsorLogo ? (
            <div className="relative w-12 h-12 shrink-0">
              <img src={sponsorLogo} alt="Logo patrocinador" className="w-full h-full object-contain rounded-lg border border-white/20" />
              <button
                type="button"
                onClick={() => { setSponsorLogo(null); setSponsorLogoFile(null); if (sponsorLogoInputRef.current) sponsorLogoInputRef.current.value = ""; }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-white/20 text-lg shrink-0">
              🏢
            </div>
          )}
          <button
            type="button"
            onClick={() => sponsorLogoInputRef.current?.click()}
            className="text-xs text-green-400 hover:text-green-300 font-medium cursor-pointer"
          >
            {sponsorLogo ? "Trocar imagem" : "Enviar imagem"}
          </button>
          <input
            ref={sponsorLogoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files?.[0], setSponsorLogo, setSponsorLogoFile)}
          />
        </div>
      </div>
    </PopupWithForm>
  );
}
