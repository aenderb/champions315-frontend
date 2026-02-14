import { useEffect, useRef } from "react";

interface ConfirmPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  errorMessage?: string | null;
}

export function ConfirmPopup({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Excluir",
  loading,
  errorMessage,
}: ConfirmPopupProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-gray-900 border border-white/15 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Corpo */}
        <div className="px-5 py-5 text-center">
          <span className="text-4xl block mb-3">⚠️</span>
          <p className="text-white/70 text-sm">{message}</p>
        </div>

        {/* Erro */}
        {errorMessage && (
          <div className="mx-5 mb-3 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium">
            <span className="shrink-0">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Botões */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 text-sm text-white/50 hover:text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white border border-red-500/50 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Excluindo..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
