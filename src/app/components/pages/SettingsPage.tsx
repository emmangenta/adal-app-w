"use client";

import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Sun, Moon, Trophy, Zap, Target } from "lucide-react";

export function SettingsPage() {
  const { user, tasks } = useApp();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user) return null;

  const isDark = mounted && resolvedTheme === "dark";
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalXP = user.xp;
  const totalCoins = user.coins;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mounted && isDark ? (
                <Moon className="size-5 text-muted-foreground" />
              ) : (
                <Sun className="size-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  {!mounted
                    ? "Resolving theme…"
                    : isDark
                      ? "Using dark theme"
                      : "Using light theme"}
                </p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={isDark}
              disabled={!mounted}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <div className="px-3 py-2 rounded-lg bg-muted text-sm">{user.username}</div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Account Level</Label>
            <div className="px-3 py-2 rounded-lg bg-muted text-sm font-medium">
              Level {user.level}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>Your learning progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="size-5 text-purple-600" />
                <span className="text-sm text-muted-foreground">Total XP</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{totalXP}</p>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="size-5 text-amber-600" />
                <span className="text-sm text-muted-foreground">Total Coins</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{totalCoins}</p>
            </div>

            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Target className="size-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Tasks Completed</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {completedTasks}/{tasks.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Information about this application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Version</Label>
            <p className="text-sm text-muted-foreground mt-1">1.0.0 (Research Prototype)</p>
          </div>
          <Separator />
          <div>
            <Label>Purpose</Label>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered learning platform with gamification elements. This is a research
              prototype for educational purposes.
            </p>
          </div>
          <Separator />
          <div>
            <Label>Features</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Document upload, AI-generated quizzes, flashcards, Feynman technique, Pomodoro
              timer, gacha system, and collectibles
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
