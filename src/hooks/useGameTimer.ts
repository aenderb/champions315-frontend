import { useState, useRef, useCallback, useEffect } from "react";

const PERIOD_DURATION = 20 * 60; // 20 minutos em segundos
const TOTAL_PERIODS = 3;

interface GameTimerState {
  /** Tempo em campo (1, 2 ou 3) */
  period: number;
  /** Segundos decorridos no tempo atual */
  elapsed: number;
  /** Cronômetro rodando? */
  running: boolean;
  /** Quantas vezes o cronômetro foi pausado */
  pauseCount: number;
  /** Tempo total (em segundos) que ficou pausado */
  totalPausedTime: number;
}

export function useGameTimer() {
  const [state, setState] = useState<GameTimerState>({
    period: 1,
    elapsed: 0,
    running: false,
    pauseCount: 0,
    totalPausedTime: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Timestamp (Date.now) de quando o cronômetro foi pausado */
  const pausedAtRef = useRef<number | null>(null);

  // Limpa o interval ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /** Inicia ou retoma o cronômetro */
  const start = useCallback(() => {
    if (state.running) return;

    // Acumula tempo pausado se havia uma pausa ativa
    if (pausedAtRef.current !== null) {
      const pausedMs = Date.now() - pausedAtRef.current;
      const pausedSecs = Math.round(pausedMs / 1000);
      setState((prev) => ({
        ...prev,
        running: true,
        totalPausedTime: prev.totalPausedTime + pausedSecs,
      }));
      pausedAtRef.current = null;
    } else {
      setState((prev) => ({ ...prev, running: true }));
    }

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        return { ...prev, elapsed: prev.elapsed + 1 };
      });
    }, 1000);
  }, [state.running]);

  /** Para o cronômetro */
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    pausedAtRef.current = Date.now();
    setState((prev) => ({ ...prev, running: false, pauseCount: prev.pauseCount + 1 }));
  }, []);

  /** Avança para o próximo tempo (para + zera + incrementa) */
  const nextPeriod = useCallback(() => {
    stop();
    pausedAtRef.current = null;
    setState((prev) => ({
      period: Math.min(prev.period + 1, TOTAL_PERIODS),
      elapsed: 0,
      running: false,
      pauseCount: 0,
      totalPausedTime: 0,
    }));
  }, [stop]);

  /** Define manualmente o tempo (1, 2 ou 3) */
  const setPeriod = useCallback(
    (p: number) => {
      stop();
      pausedAtRef.current = null;
      setState({ period: Math.max(1, Math.min(p, TOTAL_PERIODS)), elapsed: 0, running: false, pauseCount: 0, totalPausedTime: 0 });
    },
    [stop]
  );

  /** Reseta tudo (volta pro 1º tempo, 0:00) */
  const reset = useCallback(() => {
    stop();
    pausedAtRef.current = null;
    setState({ period: 1, elapsed: 0, running: false, pauseCount: 0, totalPausedTime: 0 });
  }, [stop]);

  /** Formata segundos → "MM:SS" */
  const formatted = `${String(Math.floor(state.elapsed / 60)).padStart(2, "0")}:${String(
    state.elapsed % 60
  ).padStart(2, "0")}`;

  /** Formata segundos → "MM:SS" */
  const formattedPausedTime = `${String(Math.floor(state.totalPausedTime / 60)).padStart(2, "0")}:${String(
    state.totalPausedTime % 60
  ).padStart(2, "0")}`;

  return {
    period: state.period,
    elapsed: state.elapsed,
    running: state.running,
    formatted,
    periodDuration: PERIOD_DURATION,
    totalPeriods: TOTAL_PERIODS,
    pauseCount: state.pauseCount,
    totalPausedTime: state.totalPausedTime,
    formattedPausedTime,
    start,
    stop,
    nextPeriod,
    setPeriod,
    reset,
  };
}
