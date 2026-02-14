import { useState, useRef, useEffect } from "react";
import { AGE_LIMIT, AVG_AGE_LIMIT } from "../../constants";
import { GameTimer } from "./GameTimer";

interface LineupOption {
  id: string;
  name: string;
}

interface InfoBarProps {
  teamName: string;
  totalAge: number;
  averageAge: number;
  isBelowLimit: boolean;
  hasExpulsions: boolean;
  lineupOptions: LineupOption[];
  selectedLineupId: string;
  onLineupChange: (id: string) => void;
  timer: {
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
  };
}

export function InfoBar({
  teamName,
  totalAge,
  averageAge,
  isBelowLimit,
  hasExpulsions,
  lineupOptions,
  selectedLineupId,
  onLineupChange,
  timer,
}: InfoBarProps) {
  /** Label do badge: soma ou média */
  const badgeLabel = hasExpulsions
    ? `x̄ ${averageAge}/${AVG_AGE_LIMIT}`
    : `Σ ${totalAge}/${AGE_LIMIT}`;

  const [showMobileAlert, setShowMobileAlert] = useState(false);
  const prevBelowRef = useRef(isBelowLimit);

  useEffect(() => {
    if (isBelowLimit && !prevBelowRef.current) {
      setShowMobileAlert(true);
    }
    prevBelowRef.current = isBelowLimit;
  }, [isBelowLimit]);

  return (
    <div className="w-full shrink-0 lg:w-[70%]">
      {/* Barra de informações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-1 md:mb-2 lg:mb-1 px-1 gap-1 md:gap-0">
        <div className="flex flex-col items-start md:flex-row md:items-center gap-1 md:gap-2 min-w-0">
          <div className="flex items-center justify-between md:justify-start gap-2 w-full md:w-auto">
            <h2 className="text-lg md:text-xl lg:text-xl font-bold text-white whitespace-nowrap">
              {teamName}
            </h2>
            {/* Badge de idade - visível no mobile ao lado do nome */}
            <span
              className={`md:hidden text-lg backdrop-blur-sm px-3 py-1 rounded-full font-mono font-bold ${
                isBelowLimit
                  ? "bg-red-500/20 text-red-400 border border-red-500/50"
                  : "bg-green-500/20 text-green-400 border border-green-500/50"
              }`}
            >
              {badgeLabel}
            </span>
          </div>

          {/* Seletor de escalação - abaixo do nome no mobile, ao lado no tablet/desktop */}
          <select
            value={selectedLineupId}
            onChange={(e) => onLineupChange(e.target.value)}
            className="text-xs md:text-sm lg:text-sm bg-white/10 text-white border border-white/20 rounded-lg px-2 py-1 md:px-3 md:py-1.5 cursor-pointer hover:bg-white/20 transition-colors focus:outline-none focus:ring-1 focus:ring-green-400/50 md:max-w-[200px] md:truncate"
          >
            {lineupOptions.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-gray-800 text-white">
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Badge de idade + Cronômetro - lado direito */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <span
            className={`text-lg md:text-xl lg:text-lg backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 lg:px-5 lg:py-2 rounded-full font-mono font-bold ${
              isBelowLimit
                ? "bg-red-500/20 text-red-400 border border-red-500/50"
                : "bg-green-500/20 text-green-400 border border-green-500/50"
            }`}
          >
            {badgeLabel}
          </span>
          <GameTimer {...timer} />
        </div>
      </div>

      {/* Alertas - desktop inline, mobile popup */}
      <div className="hidden md:flex min-h-[36px] lg:min-h-[36px] mb-0.5 lg:mb-0 flex-col gap-1">
        {isBelowLimit && !hasExpulsions && (
          <div className="px-2 py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-2.5 bg-red-500/15 border border-red-500/40 rounded-lg flex items-center gap-1">
            <span className="text-red-400 text-sm md:text-base lg:text-xl">⚠</span>
            <span className="text-red-300 text-[10px] md:text-xs lg:text-sm font-medium">
              Soma das idades ({totalAge}) está abaixo do mínimo de {AGE_LIMIT}! Faltam:{" "}
              {AGE_LIMIT - totalAge}
            </span>
          </div>
        )}
        {isBelowLimit && hasExpulsions && (
          <div className="px-2 py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-2.5 bg-red-500/15 border border-red-500/40 rounded-lg flex items-center gap-1">
            <span className="text-red-400 text-sm md:text-base lg:text-xl">⚠</span>
            <span className="text-red-300 text-[10px] md:text-xs lg:text-sm font-medium">
              Média de idade ({averageAge}) está abaixo do mínimo de {AVG_AGE_LIMIT}!
            </span>
          </div>
        )}
      </div>

      {/* Popup de alerta mobile */}
      {isBelowLimit && showMobileAlert && (
        <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileAlert(false)}>
          <div className="bg-gray-900 border border-red-500/50 rounded-2xl p-5 mx-4 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-red-400 font-bold text-base">Atenção!</h3>
            </div>
            <p className="text-red-300 text-sm font-medium mb-4">
              {hasExpulsions
                ? `Média de idade (${averageAge}) está abaixo do mínimo de ${AVG_AGE_LIMIT}!`
                : `Soma das idades (${totalAge}) está abaixo do mínimo de ${AGE_LIMIT}! Faltam: ${AGE_LIMIT - totalAge}`
              }
            </p>
            <button
              onClick={() => setShowMobileAlert(false)}
              className="w-full py-2 text-sm font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl transition-colors cursor-pointer"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Cronômetro mobile - próximo do campo, alinhado à direita */}
      <div className="md:hidden -mt-6 mb-2 flex justify-end">
        <GameTimer {...timer} />
      </div>
    </div>
  );
}
