"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { DEMO_KEYS } from "@/lib/client-demo-storage";

export interface Brainrot {
  id: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  image: string;
  unlocked: boolean;
}

export interface User {
  id: string;
  username: string;
  xp: number;
  level: number;
  coins: number;
  brainrots?: Brainrot[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinsReward: number;
  completed: boolean;
  type: "daily" | "weekly" | "monthly";
}

export interface StoredFlashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface StoredQuiz {
  id: string;
  deckId: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  createdAt: string;
}

export interface StoredDeck {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  flashcards: StoredFlashcard[];
  quizzes: StoredQuiz[];
}

interface AppContextType {
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  tasks: Task[];
  completeTask: (taskId: string) => void;
  brainrots: Brainrot[];
  unlockBrainrot: (brainrotId: string) => void;
  decks: StoredDeck[];
  addDeck: (deck: StoredDeck) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialBrainrots: Brainrot[] = [
  { id: "1", name: "Skibidi Scholar", rarity: "common", image: "/brainrots/br-1.svg", unlocked: true },
  { id: "2", name: "Ohio Oracle", rarity: "common", image: "/brainrots/br-2.svg", unlocked: true },
  { id: "3", name: "Rizzler Rex", rarity: "rare", image: "/brainrots/br-3.svg", unlocked: false },
  { id: "4", name: "Gyatt Golem", rarity: "rare", image: "/brainrots/br-4.svg", unlocked: false },
  { id: "5", name: "Fanum Taxinator", rarity: "epic", image: "/brainrots/br-5.svg", unlocked: false },
  { id: "6", name: "Sigma Skeleton", rarity: "epic", image: "/brainrots/br-6.svg", unlocked: false },
  { id: "7", name: "Grimace Giga-Chad", rarity: "legendary", image: "/brainrots/br-7.svg", unlocked: false },
  { id: "8", name: "Baby Gronkulus", rarity: "legendary", image: "/brainrots/br-8.svg", unlocked: false },
  { id: "9", name: "Mewing Maven", rarity: "common", image: "/brainrots/br-9.svg", unlocked: false },
  { id: "10", name: "Aura Farmer", rarity: "rare", image: "/brainrots/br-10.svg", unlocked: false },
  { id: "11", name: "Capstone No-Cap", rarity: "epic", image: "/brainrots/br-11.svg", unlocked: false },
  { id: "12", name: "Based Blob", rarity: "legendary", image: "/brainrots/br-12.svg", unlocked: false },
];

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

function generateId() {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function brainrotsFromUser(user: User | null): Brainrot[] {
  if (!user?.brainrots?.length) {
    return initialBrainrots.map((b) => ({ ...b, unlocked: b.rarity === "common" }));
  }
  const unlocked = new Set(user.brainrots.map((b) => b.id));
  return initialBrainrots.map((b) => ({
    ...b,
    unlocked: unlocked.has(b.id),
  }));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [brainrots, setBrainrots] = useState<Brainrot[]>(initialBrainrots);
  const [decks, setDecks] = useState<StoredDeck[]>([]);

  const persistUser = useCallback((next: User | null) => {
    if (next) {
      localStorage.setItem(DEMO_KEYS.currentUser, JSON.stringify(next));
    } else {
      localStorage.removeItem(DEMO_KEYS.currentUser);
    }
  }, []);

  const persistDecks = useCallback((uid: string, next: StoredDeck[]) => {
    localStorage.setItem(DEMO_KEYS.decksForUser(uid), JSON.stringify(next));
  }, []);

  const persistTasks = useCallback((uid: string, next: Task[]) => {
    localStorage.setItem(DEMO_KEYS.tasksForUser(uid), JSON.stringify(next));
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(DEMO_KEYS.currentUser);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as User;
        setUser(parsed);
        setUserId(parsed.id);
        setBrainrots(brainrotsFromUser(parsed));
        const decksRaw = localStorage.getItem(DEMO_KEYS.decksForUser(parsed.id));
        if (decksRaw) {
          setDecks(JSON.parse(decksRaw) as StoredDeck[]);
        }
        const tasksRaw = localStorage.getItem(DEMO_KEYS.tasksForUser(parsed.id));
        if (tasksRaw) {
          setTasks(JSON.parse(tasksRaw) as Task[]);
        }
      } catch (e) {
        console.error("Failed to restore demo session:", e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) persistUser(user);
  }, [user, persistUser]);

  useEffect(() => {
    if (userId && decks.length >= 0) persistDecks(userId, decks);
  }, [decks, userId, persistDecks]);

  useEffect(() => {
    if (userId && tasks.length >= 0) persistTasks(userId, tasks);
  }, [tasks, userId, persistTasks]);

  const login = async (username: string, password: string) => {
    const usersJson = localStorage.getItem(DEMO_KEYS.usersRegistry) || "[]";
    const users = JSON.parse(usersJson) as Array<User & { password: string }>;

    const found = users.find((u) => u.username === username && u.password === password);
    if (!found) {
      throw new Error("Invalid username or password");
    }

    const { password: _p, ...sessionUser } = found;
    setUser(sessionUser);
    setUserId(sessionUser.id);
    setBrainrots(brainrotsFromUser(sessionUser));

    const decksRaw = localStorage.getItem(DEMO_KEYS.decksForUser(sessionUser.id));
    setDecks(decksRaw ? (JSON.parse(decksRaw) as StoredDeck[]) : []);

    const tasksRaw = localStorage.getItem(DEMO_KEYS.tasksForUser(sessionUser.id));
    setTasks(tasksRaw ? (JSON.parse(tasksRaw) as Task[]) : initialTasks);
  };

  const register = async (username: string, password: string) => {
    if (username.length < 3) throw new Error("Username must be at least 3 characters");
    if (password.length < 6) throw new Error("Password must be at least 6 characters");

    const usersJson = localStorage.getItem(DEMO_KEYS.usersRegistry) || "[]";
    const users = JSON.parse(usersJson) as Array<User & { password: string }>;

    if (users.some((u) => u.username === username)) {
      throw new Error("Username already taken");
    }

    const commonUnlocked = initialBrainrots
      .filter((b) => b.rarity === "common")
      .map((b) => ({ ...b, unlocked: true as const }));

    const newUser: User = {
      id: generateId(),
      username,
      xp: 0,
      level: 1,
      coins: 0,
      brainrots: commonUnlocked,
    };

    users.push({ ...newUser, password });
    localStorage.setItem(DEMO_KEYS.usersRegistry, JSON.stringify(users));

    setUser(newUser);
    setUserId(newUser.id);
    setBrainrots(brainrotsFromUser(newUser));
    setDecks([]);
    setTasks(initialTasks);
    localStorage.setItem(DEMO_KEYS.tasksForUser(newUser.id), JSON.stringify(initialTasks));
    localStorage.setItem(DEMO_KEYS.decksForUser(newUser.id), JSON.stringify([]));
  };

  const logout = () => {
    setUser(null);
    setUserId(null);
    setDecks([]);
    setTasks(initialTasks);
    setBrainrots(initialBrainrots);
    localStorage.removeItem(DEMO_KEYS.currentUser);
  };

  const addXP = (amount: number) => {
    if (!user) return;
    const newXp = user.xp + amount;
    const newLevel = Math.floor(newXp / 100) + 1;
    setUser({ ...user, xp: newXp, level: newLevel });
    toast.success(`+${amount} XP!`);
  };

  const addCoins = (amount: number) => {
    if (!user) return;
    setUser({ ...user, coins: Math.max(0, user.coins + amount) });
    if (amount > 0) toast.success(`+${amount} coins!`);
  };

  const completeTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.completed || !user) return;

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t)));
    addXP(task.xpReward);
    addCoins(task.coinsReward);
  };

  const unlockBrainrot = (brainrotId: string) => {
    if (!user) return;
    const def = initialBrainrots.find((b) => b.id === brainrotId);
    if (!def) return;

    const existing = user.brainrots ?? [];
    if (existing.some((b) => b.id === brainrotId)) return;

    const nextBrainrots = [...existing, { ...def, unlocked: true }];
    setUser({ ...user, brainrots: nextBrainrots });
    setBrainrots(
      initialBrainrots.map((b) => ({
        ...b,
        unlocked: nextBrainrots.some((u) => u.id === b.id),
      }))
    );
  };

  const addDeck = (deck: StoredDeck) => {
    setDecks((prev) => [...prev, deck]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        userId,
        isLoading,
        login,
        register,
        logout,
        addXP,
        addCoins,
        tasks,
        completeTask,
        brainrots,
        unlockBrainrot,
        decks,
        addDeck,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
