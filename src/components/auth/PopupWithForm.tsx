import { useEffect, useRef } from "react";
import type { ReactNode, FormEvent } from "react";

interface PopupWithFormProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  submitDisabled?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

export function PopupWithForm({
  title,
  isOpen,
  onClose,
  onSubmit,
  submitLabel,
  submitDisabled,
  children,
  footer,
}: PopupWithFormProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fechar com Escape
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

        {/* Form */}
        <form onSubmit={onSubmit} className="px-5 py-4 flex flex-col gap-4">
          {children}

          <button
            type="submit"
            disabled={submitDisabled}
            className={`w-full py-2.5 rounded-xl font-semibold transition-colors cursor-pointer border text-sm ${
              submitDisabled
                ? "bg-gray-700 text-gray-400 border-gray-600/50 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-500 text-white border-green-500/50"
            }`}
          >
            {submitLabel}
          </button>
        </form>

        {/* Footer (links extras) */}
        {footer && (
          <div className="px-5 pb-4 text-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
