"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Coffee } from "lucide-react";
import { useApp } from "./AppContext";

export const POMODORO_SECONDS = 25 * 60;
export const POMODORO_BREAK_SECONDS = 5 * 60;

type PomodoroContextValue = {
  timeLeft: number;
  isRunning: boolean;
  isBreak: boolean;
  sessionsCompleted: number;
  progress: number;
  minutes: number;
  seconds: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
};

const PomodoroContext = createContext<PomodoroContextValue | undefined>(undefined);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const { addXP, addCoins, user } = useApp();
  const [timeLeft, setTimeLeft] = useState(POMODORO_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const endAtRef = useRef<number | null>(null);
  const isBreakRef = useRef(isBreak);
  const timeLeftRef = useRef(timeLeft);
  isBreakRef.current = isBreak;
  timeLeftRef.current = timeLeft;

  const clearEndAt = () => {
    endAtRef.current = null;
  };

  const completePhase = useCallback(() => {
    clearEndAt();
    setIsRunning(false);

    if (!isBreakRef.current) {
      setSessionsCompleted((n) => n + 1);
      if (user) {
        addXP(30);
        addCoins(5);
      }
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      toast.success("Pomodoro completed! +30 XP, +5 coins", { icon: "🎉" });
      setIsBreak(true);
      setTimeLeft(POMODORO_BREAK_SECONDS);
    } else {
      toast.success("Break complete! Ready for another session?", {
        icon: <Coffee className="size-4" />,
      });
      setIsBreak(false);
      setTimeLeft(POMODORO_SECONDS);
    }
  }, [addXP, addCoins, user]);

  useEffect(() => {
    if (!isRunning || endAtRef.current == null) return;

    const tick = () => {
      const end = endAtRef.current;
      if (end == null) return;
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setTimeLeft(left);
      if (left <= 0) {
        endAtRef.current = null;
        completePhase();
      }
    };

    tick();
    const id = window.setInterval(tick, 250);

    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [isRunning, isBreak, completePhase]);

  const start = useCallback(() => {
    let t = timeLeftRef.current;
    if (t <= 0) {
      t = isBreakRef.current ? POMODORO_BREAK_SECONDS : POMODORO_SECONDS;
    }
    endAtRef.current = Date.now() + t * 1000;
    setTimeLeft(t);
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (endAtRef.current != null) {
      const left = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setTimeLeft(left);
    }
    clearEndAt();
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    clearEndAt();
    setIsRunning(false);
    setTimeLeft(isBreakRef.current ? POMODORO_BREAK_SECONDS : POMODORO_SECONDS);
  }, []);

  const totalWork = POMODORO_SECONDS;
  const totalBreak = POMODORO_BREAK_SECONDS;
  const progress = isBreak
    ? ((totalBreak - timeLeft) / totalBreak) * 100
    : ((totalWork - timeLeft) / totalWork) * 100;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const value = useMemo(
    () => ({
      timeLeft,
      isRunning,
      isBreak,
      sessionsCompleted,
      progress,
      minutes,
      seconds,
      start,
      pause,
      reset,
    }),
    [
      timeLeft,
      isRunning,
      isBreak,
      sessionsCompleted,
      progress,
      minutes,
      seconds,
      start,
      pause,
      reset,
    ]
  );

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
}

export function usePomodoro() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) {
    throw new Error("usePomodoro must be used within PomodoroProvider");
  }
  return ctx;
}
