"use client";

import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { Play, Pause, RotateCw, Coffee } from "lucide-react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";

const POMODORO_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export function PomodoroTimer() {
  const { addXP, addCoins } = useApp();
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (!isBreak) {
      setSessionsCompleted(sessionsCompleted + 1);
      addXP(30);
      addCoins(5);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      toast.success("Pomodoro completed! +30 XP, +5 coins", {
        icon: "🎉",
      });
      setIsBreak(true);
      setTimeLeft(BREAK_TIME);
    } else {
      toast.success("Break complete! Ready for another session?", {
        icon: <Coffee className="size-4" />,
      });
      setIsBreak(false);
      setTimeLeft(POMODORO_TIME);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? BREAK_TIME : POMODORO_TIME);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = isBreak
    ? ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100
    : ((POMODORO_TIME - timeLeft) / POMODORO_TIME) * 100;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pomodoro Timer</h1>
        <p className="text-muted-foreground">
          Stay focused with the Pomodoro Technique: 25 minutes work, 5 minutes break
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sessions Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sessionsCompleted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total XP Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {sessionsCompleted * 30}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Coins Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {sessionsCompleted * 5}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle>
            {isBreak ? (
              <span className="flex items-center justify-center gap-2">
                <Coffee className="size-5" />
                Break Time
              </span>
            ) : (
              "Focus Session"
            )}
          </CardTitle>
          <CardDescription>
            {isBreak
              ? "Relax and recharge for the next session"
              : "Stay focused and minimize distractions"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="relative">
            <svg className="w-full max-w-md mx-auto" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted opacity-20"
              />
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                className={isBreak ? "text-green-500" : "text-purple-500"}
                style={{ transform: "rotate(-90deg)", transformOrigin: "100px 100px" }}
                initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - progress / 100) }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold tabular-nums">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {isRunning ? "Running..." : "Paused"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            {!isRunning ? (
              <Button onClick={handleStart} size="lg" className="gap-2 min-w-32">
                <Play className="size-5" />
                Start
              </Button>
            ) : (
              <Button onClick={handlePause} size="lg" variant="secondary" className="gap-2 min-w-32">
                <Pause className="size-5" />
                Pause
              </Button>
            )}
            <Button onClick={handleReset} size="lg" variant="outline" className="gap-2">
              <RotateCw className="size-5" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-medium text-purple-600">1</span>
            </div>
            <div>
              <p className="font-medium">Focus for 25 minutes</p>
              <p className="text-sm text-muted-foreground">
                Work on a single task without distractions
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-medium text-green-600">2</span>
            </div>
            <div>
              <p className="font-medium">Take a 5-minute break</p>
              <p className="text-sm text-muted-foreground">
                Relax, stretch, or grab a drink
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-medium text-blue-600">3</span>
            </div>
            <div>
              <p className="font-medium">Earn rewards</p>
              <p className="text-sm text-muted-foreground">
                Get +30 XP and +5 coins for each completed session
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
