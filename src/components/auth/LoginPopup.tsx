import { useState } from "react";
import type { FormEvent } from "react";
import { PopupWithForm } from "./PopupWithForm";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
  onSwitchToRegister: () => void;
  errorMessage?: string | null;
}

export function LoginPopup({ isOpen, onClose, onLogin, onSwitchToRegister, errorMessage }: LoginPopupProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = email.trim().length > 0 && password.length >= 6;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    onLogin(email.trim(), password);
  };

  return (
    <PopupWithForm
      title="Entrar"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Entrar"
      submitDisabled={!canSubmit}
      errorMessage={errorMessage}
      footer={
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors cursor-pointer"
        >
          Não tem conta? Inscrever-se
        </button>
      }
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium">E-mail <span className="text-red-400">*</span></label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          autoFocus
          className="w-full text-sm text-white bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/50 placeholder:text-white/30"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium">Senha <span className="text-red-400">*</span></label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full text-sm text-white bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/50 placeholder:text-white/30"
        />
      </div>
    </PopupWithForm>
  );
}
