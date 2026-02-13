interface GameTimerProps {
  period: number;
  formatted: string;
  running: boolean;
  totalPeriods: number;
  pauseCount: number;
  formattedPausedTime: string;
  onStart: () => void;
  onStop: () => void;
  onNextPeriod: () => void;
  onSetPeriod: (p: number) => void;
  onReset: () => void;
  onFinish: () => void;
}

export function GameTimer({
  period,
  formatted,
  running,
  totalPeriods,
  pauseCount,
  formattedPausedTime,
  onStart,
  onStop,
  onSetPeriod,
  onReset,
  onFinish,
}: GameTimerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-1 mt-1">
      {/* Display principal */}
      <div className="bg-gray-900/85 backdrop-blur-sm rounded-lg border border-white/20 px-2 py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-2 flex items-center gap-2 md:gap-3">
        {/* Seletor de tempo */}
        <select
          value={period}
          onChange={(e) => onSetPeriod(Number(e.target.value))}
          className="bg-transparent text-white text-xs md:text-sm lg:text-sm font-bold border-none cursor-pointer focus:outline-none"
        >
          {Array.from({ length: totalPeriods }, (_, i) => (
            <option key={i + 1} value={i + 1} className="bg-gray-800 text-white">
              {i + 1}ºT
            </option>
          ))}
        </select>

        {/* Cronômetro */}
        <span className="text-white text-lg md:text-xl lg:text-2xl font-mono font-bold tabular-nums min-w-[60px] md:min-w-[70px] text-center">
          {formatted}
        </span>

        {/* Botões */}
        <div className="flex items-center gap-1">
          {/* Iniciar / Parar */}
          {!running ? (
            <button
              onClick={onStart}
              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-green-600 hover:bg-green-500 rounded-full transition-colors cursor-pointer"
              title="Iniciar"
            >
              <span className="text-white text-sm md:text-base leading-none">▶︎</span>
            </button>
          ) : (
            <button
              onClick={onStop}
              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-red-600 hover:bg-red-500 rounded-full transition-colors cursor-pointer"
              title="Pausar"
            >
              <span className="text-white text-sm md:text-base leading-none">⏸︎</span>
            </button>
          )}

          {/* Resetar */}
          <button
            onClick={onReset}
            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            title="Resetar"
          >
            <span className="text-white text-sm md:text-base font-bold leading-none">0</span>
          </button>

          {/* Finalizar Jogo */}
          <button
            onClick={onFinish}
            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-orange-600 hover:bg-orange-500 rounded-full transition-colors cursor-pointer"
            title="Finalizar Jogo"
          >
            <span className="text-white text-xs md:text-sm font-bold leading-none">■</span>
          </button>
        </div>
      </div>

      {/* Badge de pausas — aparece se pausou ao menos 1 vez */}
      {pauseCount > 0 && (
        <div className="bg-yellow-500/90 backdrop-blur-sm rounded-md px-2 py-0.5 md:px-2.5 md:py-1 flex items-center gap-1.5 text-xs md:text-sm font-bold text-gray-900 border border-yellow-400/50">
          <span>⏸︎ {pauseCount}x</span>
          <span className="text-gray-700">|</span>
          <span>{formattedPausedTime}</span>
        </div>
      )}
    </div>
  );
}
