"use client";

import Link from "next/link";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { BookOpen, CheckCircle2, Coins, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";

export function Dashboard() {
  const { user, tasks, completeTask } = useApp();

  if (!user) return null;

  const dailyTasks = tasks.filter((t) => t.type === "daily");
  const weeklyTasks = tasks.filter((t) => t.type === "weekly");
  const monthlyTasks = tasks.filter((t) => t.type === "monthly");

  const handleCompleteTask = (taskId: string, xp: number, coins: number) => {
    completeTask(taskId);
    toast.success(`Task completed! +${xp} XP, +${coins} coins`, {
      icon: <Trophy className="size-4" />,
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.username}!</h1>
        <p className="text-muted-foreground">Ready to level up your learning?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <Zap className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Level {user.level}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {user.xp % 100} / 100 XP to next level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Adal Coins</CardTitle>
            <Coins className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{user.coins}</div>
            <p className="text-xs text-muted-foreground mt-1">Spend on gacha rolls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle2 className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {tasks.filter((t) => t.completed).length}/{tasks.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Keep up the momentum!</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump into your learning activities</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/app/upload">
            <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
              <BookOpen className="size-8" />
              <span>Upload Document</span>
            </Button>
          </Link>
          <Link href="/app/study">
            <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
              <Zap className="size-8" />
              <span>Start Studying</span>
            </Button>
          </Link>
          <Link href="/app/pomodoro">
            <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
              <Trophy className="size-8" />
              <span>Pomodoro Timer</span>
            </Button>
          </Link>
          <Link href="/app/gacha">
            <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
              <Coins className="size-8" />
              <span>Mystery Box</span>
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks & Challenges</CardTitle>
          <CardDescription>Complete tasks to earn XP and coins</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-3 mt-6">
              {dailyTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() =>
                    handleCompleteTask(task.id, task.xpReward, task.coinsReward)
                  }
                />
              ))}
            </TabsContent>

            <TabsContent value="weekly" className="space-y-3 mt-6">
              {weeklyTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() =>
                    handleCompleteTask(task.id, task.xpReward, task.coinsReward)
                  }
                />
              ))}
            </TabsContent>

            <TabsContent value="monthly" className="space-y-3 mt-6">
              {monthlyTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() =>
                    handleCompleteTask(task.id, task.xpReward, task.coinsReward)
                  }
                />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskCard({
  task,
  onComplete,
}: {
  task: { id: string; title: string; description: string; xpReward: number; coinsReward: number; completed: boolean };
  onComplete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="font-medium">{task.title}</h4>
          {task.completed && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="size-3" />
              Completed
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{task.description}</p>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-xs flex items-center gap-1 text-purple-600">
            <Zap className="size-3" />
            +{task.xpReward} XP
          </span>
          <span className="text-xs flex items-center gap-1 text-amber-600">
            <Coins className="size-3" />
            +{task.coinsReward} coins
          </span>
        </div>
      </div>
      <Button
        size="sm"
        onClick={onComplete}
        disabled={task.completed}
        className="ml-4"
      >
        {task.completed ? "Done" : "Complete"}
      </Button>
    </motion.div>
  );
}
