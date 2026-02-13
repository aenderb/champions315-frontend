import type { Player } from "../../types";
import { PlayerBadge } from "./PlayerBadge";

interface BenchListProps {
  bench: Player[];
  expelledPlayers: Player[];
  isPlayerSelected: boolean;
  selectedPlayerName: string | null;
  selectedPlayerHasYellow: boolean;
  onPlayerClick: (index: number) => void;
  onCancel: () => void;
  onRedCard: () => void;
  onYellowCard: () => void;
}

export function BenchList({
  bench,
  expelledPlayers,
  isPlayerSelected,
  selectedPlayerName,
  selectedPlayerHasYellow,
  onPlayerClick,
  onCancel,
  onRedCard,
  onYellowCard,
}: BenchListProps) {
  return (
    <div className="shrink-0 mt-1 md:mt-2 lg:mt-1 lg:w-[70%]">
      <h3 className="text-xs md:text-sm lg:text-xs font-semibold text-white/70 mb-1 md:mb-2 lg:mb-1 px-1">
        Reservas ({bench.length})
        {isPlayerSelected && selectedPlayerName && (
          <span className="text-yellow-400 text-[10px] md:text-xs lg:text-sm ml-1">
            — {selectedPlayerName} selecionado
          </span>
        )}
      </h3>
      <div className="flex overflow-x-auto gap-4 md:gap-5 lg:gap-3 bg-white/5 backdrop-blur-sm rounded-lg md:rounded-xl lg:rounded-lg p-2 md:p-4 lg:p-2 border border-white/10 min-h-[70px] md:min-h-[90px] lg:min-h-[60px] scrollbar-thin">
        {/* Botões de ação quando um jogador está selecionado */}
        {isPlayerSelected && (
          <>
            {/* Cancelar */}
            <div className="flex-shrink-0">
              <button
                onClick={onCancel}
                className="flex flex-col items-center justify-center gap-0.5 md:gap-1 w-16 md:w-20 lg:w-24 h-full min-h-[54px] md:min-h-[66px] bg-gray-500/20 hover:bg-gray-500/40 border-2 border-gray-500/50 rounded-lg transition-colors cursor-pointer"
                title="Cancelar"
              >
                <span className="text-gray-300 text-xl md:text-2xl font-bold leading-none">✕</span>
                <span className="text-gray-400 text-[9px] md:text-[10px] font-semibold leading-tight">Cancelar</span>
              </button>
            </div>

            {/* Cartão Vermelho */}
            <div className="flex-shrink-0">
              <button
                onClick={onRedCard}
                className="flex flex-col items-center justify-center gap-1 md:gap-1.5 w-16 md:w-20 lg:w-24 h-full min-h-[54px] md:min-h-[66px] bg-red-900/30 hover:bg-red-900/50 border-2 border-red-700/40 rounded-lg transition-colors cursor-pointer"
                title="Cartão Vermelho"
              >
                <div className="w-4 h-5 md:w-5 md:h-6 bg-red-600 rounded-sm shadow-md"></div>
                <span className="text-red-300 text-[9px] md:text-[10px] font-semibold leading-tight">Vermelho</span>
              </button>
            </div>

            {/* Cartão Amarelo */}
            <div className="flex-shrink-0">
              <button
                onClick={onYellowCard}
                disabled={selectedPlayerHasYellow}
                className={`flex flex-col items-center justify-center gap-1 md:gap-1.5 w-16 md:w-20 lg:w-24 h-full min-h-[54px] md:min-h-[66px] rounded-lg transition-colors ${
                  selectedPlayerHasYellow
                    ? "bg-gray-800/40 border-2 border-gray-600/30 cursor-not-allowed opacity-40"
                    : "bg-yellow-900/30 hover:bg-yellow-900/50 border-2 border-yellow-600/40 cursor-pointer"
                }`}
                title={selectedPlayerHasYellow ? "Jogador já possui cartão amarelo" : "Cartão Amarelo"}
              >
                <div className={`w-4 h-5 md:w-5 md:h-6 rounded-sm shadow-md ${selectedPlayerHasYellow ? "bg-yellow-400/30" : "bg-yellow-400"}`}></div>
                <span className={`text-[9px] md:text-[10px] font-semibold leading-tight ${selectedPlayerHasYellow ? "text-gray-500" : "text-yellow-300"}`}>Amarelo</span>
              </button>
            </div>
          </>
        )}

        {bench.length > 0 ? (
          bench.map((player, idx) => (
            <div key={player.number} className="flex-shrink-0">
              <PlayerBadge
                player={player}
                color={isPlayerSelected ? "#3b82f6" : "#6b7280"}
                onClick={() => onPlayerClick(idx)}
                highlight={isPlayerSelected}
              />
            </div>
          ))
        ) : (
          !isPlayerSelected && expelledPlayers.length === 0 && (
            <span className="text-white/30 text-sm italic self-center">
              Nenhum reserva disponível
            </span>
          )
        )}

        {/* Separador + Jogadores expulsos */}
        {expelledPlayers.length > 0 && (
          <>
            {(bench.length > 0 || isPlayerSelected) && (
              <div className="flex-shrink-0 self-stretch flex items-center">
                <div className="w-px h-3/4 bg-red-500/40"></div>
              </div>
            )}
            {expelledPlayers.map((player) => (
              <div key={`expelled-${player.id}`} className="flex-shrink-0">
                <PlayerBadge
                  player={player}
                  color="#991b1b"
                  hasRedCard
                  inactive
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
