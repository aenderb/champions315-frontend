import { useState, useRef } from "react";
import type { FormEvent } from "react";
import { PopupWithForm } from "./PopupWithForm";

interface RegisterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (name: string, email: string, password: string, avatar: string | null) => void;
  onSwitchToLogin: () => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function RegisterPopup({ isOpen, onClose, onRegister, onSwitchToLogin }: RegisterPopupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (file: File | undefined) => {
    if (!file) return;
    const base64 = await fileToBase64(file);
    setAvatar(base64);
  };

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && password.length >= 6;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    onRegister(name.trim(), email.trim(), password, avatar);
  };

  return (
    <PopupWithForm
      title="Inscrever-se"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Inscrever-se"
      submitDisabled={!canSubmit}
      footer={
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors cursor-pointer"
        >
          Já tem conta? Entrar
        </button>
      }
    >
      {/* Avatar */}
      <div className="flex flex-col gap-1 items-center">
        <div className="relative">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-white/20" />
          ) : (
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/20 text-2xl">
              👤
            </div>
          )}
          {avatar && (
            <button
              type="button"
              onClick={() => { setAvatar(null); if (avatarInputRef.current) avatarInputRef.current.value = ""; }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className="text-xs text-green-400 hover:text-green-300 font-medium cursor-pointer mt-1"
        >
          {avatar ? "Trocar foto" : "Adicionar foto"}
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium">Nome completo</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          autoFocus
          className="w-full text-sm text-white bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/50 placeholder:text-white/30"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full text-sm text-white bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/50 placeholder:text-white/30"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          className="w-full text-sm text-white bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/50 placeholder:text-white/30"
        />
      </div>
    </PopupWithForm>
  );
}
