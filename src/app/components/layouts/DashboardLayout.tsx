"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "../../context/AppContext";
import { usePomodoro } from "../../context/PomodoroContext";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { cn } from "../ui/utils";
import {
  LayoutDashboard,
  Upload,
  BookOpen,
  Brain,
  Timer,
  Play,
  Pause,
  Gift,
  Library,
  Settings,
  LogOut,
  Coins,
} from "lucide-react";
import { useEffect } from "react";

function PomodoroMiniDock() {
  const pathname = usePathname();
  const { minutes, seconds, isRunning, isBreak, start, pause } = usePomodoro();
  const onPomodoroPage = pathname === "/app/pomodoro";

  if (onPomodoroPage) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-lg">
      <div className="flex flex-col min-w-[7rem]">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {isBreak ? "Break" : "Pomodoro"}
        </span>
        <span className="font-mono text-lg font-semibold tabular-nums leading-none">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
      {!isRunning ? (
        <Button type="button" size="icon" variant="secondary" className="shrink-0" onClick={start}>
          <Play className="size-4" />
        </Button>
      ) : (
        <Button type="button" size="icon" variant="secondary" className="shrink-0" onClick={pause}>
          <Pause className="size-4" />
        </Button>
      )}
      <Button type="button" size="sm" variant="outline" asChild className="shrink-0">
        <Link href="/app/pomodoro">Open</Link>
      </Button>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
    }
  }, [user, router, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        Loading session…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const xpIntoLevel = user.xp % 100;
  const xpProgress = xpIntoLevel;
  const xpNeeded = 100;

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "" },
    { icon: Upload, label: "Upload", path: "upload" },
    { icon: BookOpen, label: "Study", path: "study" },
    { icon: Brain, label: "Feynman Mode", path: "feynman" },
    { icon: Timer, label: "Pomodoro", path: "pomodoro" },
    { icon: Gift, label: "Gacha", path: "gacha" },
    { icon: Library, label: "Collection", path: "collection" },
    { icon: Settings, label: "Settings", path: "settings" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            ADAL
          </h1>
        </div>

        <div className="p-4 border-b border-border">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Level {user.level}</span>
              <span className="text-sm font-medium">{xpProgress}/{xpNeeded} XP</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Coins className="size-5 text-amber-500" />
            <span className="font-semibold text-amber-600 dark:text-amber-400">{user.coins}</span>
            <span className="text-sm text-muted-foreground">Adal Coins</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const itemPath = item.path ? `/app/${item.path}` : "/app";
            const isActive = pathname === itemPath;
            return (
              <Link key={itemPath} href={itemPath}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-secondary"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-3 px-3 py-2 rounded-lg bg-muted">
            <p className="text-sm font-medium">{user.username}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <PomodoroMiniDock />
    </div>
  );
}
