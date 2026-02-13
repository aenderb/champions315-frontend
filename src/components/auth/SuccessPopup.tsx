import { PopupWithForm } from "./PopupWithForm";
import type { FormEvent } from "react";

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToLogin: () => void;
}

export function SuccessPopup({ isOpen, onClose, onGoToLogin }: SuccessPopupProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onGoToLogin();
  };

  return (
    <PopupWithForm
      title="Inscrição realizada!"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Ir para Login"
    >
      <div className="text-center py-2">
        <span className="text-4xl block mb-3">✅</span>
        <p className="text-white/70 text-sm">
          Sua conta foi criada com sucesso. Faça login para começar.
        </p>
      </div>
    </PopupWithForm>
  );
}
