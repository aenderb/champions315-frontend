import type { Player } from "../../types";
import { calcAge } from "../../utils/age";
import { contrastColor } from "../../utils/color";

interface PlayerBadgeProps {
  player: Player;
  color: string;
  onClick?: () => void;
  highlight?: boolean;
  hasYellowCard?: boolean;
  hasRedCard?: boolean;
  inactive?: boolean;
}

export function PlayerBadge({ player, color, onClick, highlight, hasYellowCard, hasRedCard, inactive }: PlayerBadgeProps) {
  const textColor = contrastColor(color);

  return (
    <div
      className={`flex flex-col items-center gap-0 transition-all ${
        inactive ? "opacity-50 cursor-default" : "cursor-pointer"
      } ${
        highlight ? "scale-110" : ""
      }`}
      onClick={inactive ? undefined : onClick}
    >
      <div className="relative">
        {/* Conteúdo do jogador (com grayscale quando inativo) */}
        <div className={inactive ? "grayscale" : ""}>
          {/* Avatar circular */}
          <div
            className={`w-11 h-11 md:w-13 md:h-13 lg:w-16 lg:h-16 rounded-full mx-auto mb-[-10px] md:mb-[-12px] lg:mb-[-14px] relative z-10 border-2 lg:border-3 overflow-hidden ${
              highlight ? "border-yellow-400" : "border-white/50"
            }`}
            style={{ backgroundColor: color }}
          >
            <img
              src={player.avatar || "https://avatars.githubusercontent.com/u/11418532?v=4&size=64"}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          </div>

          <svg
            viewBox="0 0 72 56"
            className={`w-16 h-9 md:w-20 md:h-11 lg:w-24 lg:h-14 drop-shadow-lg transition-all hover:scale-110 ${
              highlight ? "drop-shadow-[0_0_6px_rgba(250,204,21,0.7)]" : ""
            }`}
          >
            {/* Camiseta estilo flat */}
            <path
              d="M24 0 L48 0 L50 2 L54 2 Q63 4 68 10 L72 16 L63 20 L56 11 L56 48 Q56 52 50 54 L22 54 Q16 52 16 48 L16 11 L9 20 L0 16 L4 10 Q9 4 18 2 L22 2 Z"
              fill={color}
              stroke={highlight ? "#facc15" : "rgba(255,255,255,0.35)"}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Gola em V */}
            <path
              d="M24 0 L36 9 L48 0"
              fill="none"
              stroke={textColor === "#ffffff" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.25)"}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Número na camiseta */}
            <text
              x="36"
              y="34"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={textColor}
              fontWeight="bold"
              fontSize="17"
              fontFamily="system-ui, sans-serif"
            >
              {player.number}
            </text>
          </svg>

          {/* Badge de idade */}
          <span className="absolute -top-1 -right-1 md:-top-1 md:-right-2 lg:-top-1 lg:-right-2 bg-gray-900 text-white text-[9px] md:text-[10px] lg:text-xs font-bold rounded-full w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 flex items-center justify-center border border-white/40 z-20">
            {calcAge(player.birthDate)}
          </span>

          {/* Cartão amarelo */}
          {hasYellowCard && !hasRedCard && (
            <span className="absolute -top-1 -left-1 md:-top-1 md:-left-2 lg:-top-1 lg:-left-2 z-20">
              <span className="inline-block w-3 h-4 md:w-3.5 md:h-4.5 lg:w-4 lg:h-5 bg-yellow-400 rounded-sm border border-yellow-600/50 shadow-md"></span>
            </span>
          )}
        </div>

        {/* Cartão vermelho — fora do grayscale para manter a cor */}
        {hasRedCard && (
          <span className="absolute -top-1 -left-1 md:-top-1 md:-left-2 lg:-top-1 lg:-left-2 z-30">
            <span className="inline-block w-3 h-4 md:w-3.5 md:h-4.5 lg:w-4 lg:h-5 bg-red-600 rounded-sm border border-red-800/50 shadow-lg"></span>
          </span>
        )}
      </div>
      <span className="text-xs md:text-sm lg:text-base text-white font-bold drop-shadow-md text-center leading-tight max-w-18 md:max-w-24 lg:max-w-28 truncate">
        {player.name}
      </span>
    </div>
  );
}
