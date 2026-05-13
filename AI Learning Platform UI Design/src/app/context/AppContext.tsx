import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  username: string;
  xp: number;
  level: number;
  coins: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinsReward: number;
  completed: boolean;
  type: "daily" | "weekly" | "monthly";
}

interface Brainrot {
  id: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  image: string;
}

interface AppContextType {
  user: User | null;
  login: (username: string, password: string) => void;
  register: (username: string, password: string) => void;
  logout: () => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  tasks: Task[];
  completeTask: (taskId: string) => void;
  brainrots: Brainrot[];
  unlockBrainrot: (brainrotId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialTasks: Task[] = [
  {
    id: "daily-1",
    title: "Complete 5 Quiz Questions",
    description: "Answer 5 questions correctly",
    xpReward: 50,
    coinsReward: 10,
    completed: false,
    type: "daily",
  },
  {
    id: "daily-2",
    title: "Study for 25 minutes",
    description: "Complete one Pomodoro session",
    xpReward: 30,
    coinsReward: 5,
    completed: false,
    type: "daily",
  },
  {
    id: "daily-3",
    title: "Review 10 Flashcards",
    description: "Go through flashcard deck",
    xpReward: 25,
    coinsReward: 5,
    completed: false,
    type: "daily",
  },
  {
    id: "weekly-1",
    title: "Upload 3 Documents",
    description: "Upload study materials",
    xpReward: 150,
    coinsReward: 30,
    completed: false,
    type: "weekly",
  },
  {
    id: "weekly-2",
    title: "Complete 50 Questions",
    description: "Answer questions throughout the week",
    xpReward: 200,
    coinsReward: 50,
    completed: false,
    type: "weekly",
  },
  {
    id: "monthly-1",
    title: "Reach Level 5",
    description: "Level up through consistent studying",
    xpReward: 500,
    coinsReward: 100,
    completed: false,
    type: "monthly",
  },
];

const initialBrainrots: Brainrot[] = [
  { id: "1", name: "Study Owl", rarity: "common", unlocked: true, image: "🦉" },
  { id: "2", name: "Brain", rarity: "common", unlocked: true, image: "🧠" },
  { id: "3", name: "Lightning", rarity: "rare", unlocked: false, image: "⚡" },
  { id: "4", name: "Star", rarity: "rare", unlocked: false, image: "⭐" },
  { id: "5", name: "Fire", rarity: "epic", unlocked: false, image: "🔥" },
  { id: "6", name: "Trophy", rarity: "epic", unlocked: false, image: "🏆" },
  { id: "7", name: "Diamond", rarity: "legendary", unlocked: false, image: "💎" },
  { id: "8", name: "Crown", rarity: "legendary", unlocked: false, image: "👑" },
  { id: "9", name: "Book", rarity: "common", unlocked: false, image: "📚" },
  { id: "10", name: "Rocket", rarity: "rare", unlocked: false, image: "🚀" },
  { id: "11", name: "Magic", rarity: "epic", unlocked: false, image: "✨" },
  { id: "12", name: "Galaxy", rarity: "legendary", unlocked: false, image: "🌌" },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [brainrots, setBrainrots] = useState<Brainrot[]>(initialBrainrots);

  const login = (username: string, password: string) => {
    setUser({
      username,
      xp: 250,
      level: 3,
      coins: 45,
    });
  };

  const register = (username: string, password: string) => {
    setUser({
      username,
      xp: 0,
      level: 1,
      coins: 0,
    });
  };

  const logout = () => {
    setUser(null);
  };

  const addXP = (amount: number) => {
    if (!user) return;
    const newXP = user.xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    setUser({ ...user, xp: newXP, level: newLevel });
  };

  const addCoins = (amount: number) => {
    if (!user) return;
    setUser({ ...user, coins: user.coins + amount });
  };

  const completeTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.completed) return;

    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t)));
    addXP(task.xpReward);
    addCoins(task.coinsReward);
  };

  const unlockBrainrot = (brainrotId: string) => {
    setBrainrots(brainrots.map((b) => (b.id === brainrotId ? { ...b, unlocked: true } : b)));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        addXP,
        addCoins,
        tasks,
        completeTask,
        brainrots,
        unlockBrainrot,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
