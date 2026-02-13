export function EmptySlotBadge() {
  return (
    <div className="flex flex-col items-center gap-0.5 md:gap-1 lg:gap-1.5">
      <div className="relative">
        <svg
          viewBox="0 0 72 56"
          className="w-16 h-9 md:w-20 md:h-11 lg:w-24 lg:h-14 animate-pulse opacity-50"
        >
          {/* Camiseta estilo flat */}
          <path
            d="M24 0 L48 0 L50 2 L54 2 Q63 4 68 10 L72 16 L63 20 L56 11 L56 48 Q56 52 50 54 L22 54 Q16 52 16 48 L16 11 L9 20 L0 16 L4 10 Q9 4 18 2 L22 2 Z"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeLinejoin="round"
          />

          {/* Gola em V */}
          <path
            d="M24 0 L36 9 L48 0"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            strokeLinejoin="round"
          />

          {/* Interrogação */}
          <text
            x="36"
            y="34"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.5)"
            fontWeight="bold"
            fontSize="17"
            fontFamily="system-ui, sans-serif"
          >
            ?
          </text>
        </svg>

        {/* Espaço invisível para manter mesma altura do PlayerBadge com badge de idade */}
        <span className="absolute -top-1 -right-1 md:-top-1 md:-right-2 lg:-top-1 lg:-right-2 w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
      </div>
      <span className="text-xs md:text-sm lg:text-base text-white/40 font-medium text-center max-w-18 md:max-w-24 lg:max-w-28">
        vazio
      </span>
    </div>
  );
}
