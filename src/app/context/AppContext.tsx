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
import type { StoredDeck } from "@/lib/study-deck-types";
import { loadDecksForUser, persistDecksForUser } from "@/lib/deck-idb";
import { sanitizeStoredDeck } from "@/lib/deck-sanitize";
import { BRAINROT_CATALOG_BASE } from "@/lib/brainrot-catalog";

/** Level from lifetime XP: level 1 at 0–99 XP, level 2 at 100–199, … */
function levelFromTotalXp(xp: number): number {
  return Math.floor(Math.max(0, xp) / 100) + 1;
}

export type { StoredFlashcard, StoredQuiz, StoredDeck } from "@/lib/study-deck-types";

export interface Brainrot {
  id: string;
  name: string;
  rarity:
    | "common"
    | "rare"
    | "epic"
    | "legendary"
    | "mythic"
    | "brainrot_god"
    | "secret";
  image: string;
  unlocked: boolean;
  count: number;
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

const initialBrainrots: Brainrot[] = BRAINROT_CATALOG_BASE.map((b) => ({
  ...b,
  unlocked: false,
  count: 0,
}));

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

/** Keep registry row in sync so re-login after refresh restores latest XP/coins/brainrots. */
function syncUserToRegistry(updated: User) {
  try {
    const usersJson = localStorage.getItem(DEMO_KEYS.usersRegistry) || "[]";
    const users = JSON.parse(usersJson) as Array<User & { password: string }>;
    const idx = users.findIndex((u) => u.id === updated.id);
    if (idx === -1) return;
    const password = users[idx].password;
    users[idx] = { ...updated, password };
    localStorage.setItem(DEMO_KEYS.usersRegistry, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to sync user to registry:", e);
  }
}

/**
 * Old builds registered users with every common pre-unlocked at count 0.
 * Gacha always sets count >= 1 on first unlock, so count===0 + unlocked common is unearned legacy data.
 */
function stripLegacyFreeCommonBrainrots(brainrots: Brainrot[] | undefined): Brainrot[] | undefined {
  if (!brainrots?.length) return brainrots;
  const filtered = brainrots.filter(
    (b) => !(b.rarity === "common" && b.unlocked && (b.count ?? 0) === 0)
  );
  return filtered.length === brainrots.length ? brainrots : filtered;
}

function brainrotsFromUser(user: User | null): Brainrot[] {
  const cleaned = stripLegacyFreeCommonBrainrots(user?.brainrots) ?? user?.brainrots ?? [];
  const unlockedMap = new Map(cleaned.map((b) => [b.id, { unlocked: b.unlocked, count: b.count }]));
  return initialBrainrots.map((b) => ({
    ...b,
    unlocked: unlockedMap.get(b.id)?.unlocked ?? false,
    count: unlockedMap.get(b.id)?.count ?? 0,
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
      syncUserToRegistry(next);
    } else {
      localStorage.removeItem(DEMO_KEYS.currentUser);
    }
  }, []);

  const persistTasks = useCallback((uid: string, next: Task[]) => {
    localStorage.setItem(DEMO_KEYS.tasksForUser(uid), JSON.stringify(next));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = localStorage.getItem(DEMO_KEYS.currentUser);
      if (!raw) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      try {
        const parsed = JSON.parse(raw) as User;
        if (cancelled) return;
        const cleanedBrainrots = stripLegacyFreeCommonBrainrots(parsed.brainrots) ?? parsed.brainrots;
        const normalized =
          cleanedBrainrots === parsed.brainrots
            ? parsed
            : { ...parsed, brainrots: cleanedBrainrots };
        setUser({
          ...normalized,
          level: levelFromTotalXp(parsed.xp),
        });
        setUserId(parsed.id);
        setBrainrots(brainrotsFromUser(normalized));
        const loadedDecks = await loadDecksForUser(parsed.id);
        if (!cancelled) setDecks(loadedDecks);

        const tasksRaw = localStorage.getItem(DEMO_KEYS.tasksForUser(parsed.id));
        if (tasksRaw && !cancelled) {
          setTasks(JSON.parse(tasksRaw) as Task[]);
        }
      } catch (e) {
        console.error("Failed to restore demo session:", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user) persistUser(user);
  }, [user, persistUser]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        await persistDecksForUser(userId, decks);
      } catch (e) {
        console.error("Failed to persist decks:", e);
      }
    })();
  }, [decks, userId]);

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

    const { password: _p, ...fromRegistry } = found;

    let sessionUser: User = fromRegistry;
    try {
      const raw = localStorage.getItem(DEMO_KEYS.currentUser);
      if (raw) {
        const cur = JSON.parse(raw) as User;
        if (cur.id === fromRegistry.id) {
          const mergedBrainrots = cur.brainrots ?? fromRegistry.brainrots;
          const cleaned = stripLegacyFreeCommonBrainrots(mergedBrainrots) ?? mergedBrainrots;
          sessionUser = {
            ...fromRegistry,
            xp: cur.xp,
            coins: cur.coins,
            level: levelFromTotalXp(cur.xp),
            brainrots: cleaned,
          };
        }
      }
    } catch {
      /* use registry only */
    }

    const loginCleaned = stripLegacyFreeCommonBrainrots(sessionUser.brainrots) ?? sessionUser.brainrots;
    sessionUser =
      loginCleaned === sessionUser.brainrots ? sessionUser : { ...sessionUser, brainrots: loginCleaned };

    setUser(sessionUser);
    setUserId(sessionUser.id);
    setBrainrots(brainrotsFromUser(sessionUser));

    const loadedDecks = await loadDecksForUser(sessionUser.id);
    setDecks(loadedDecks);

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

    const newUser: User = {
      id: generateId(),
      username,
      xp: 0,
      level: 1,
      coins: 0,
      brainrots: [],
    };

    users.push({ ...newUser, password });
    localStorage.setItem(DEMO_KEYS.usersRegistry, JSON.stringify(users));

    setUser(newUser);
    setUserId(newUser.id);
    setBrainrots(brainrotsFromUser(newUser));
    setDecks([]);
    setTasks(initialTasks);
    localStorage.setItem(DEMO_KEYS.tasksForUser(newUser.id), JSON.stringify(initialTasks));
    localStorage.setItem(DEMO_KEYS.deckIdsForUser(newUser.id), JSON.stringify([]));
  };

  const logout = () => {
    setUser(null);
    setUserId(null);
    setDecks([]);
    setTasks(initialTasks);
    setBrainrots(initialBrainrots);
    localStorage.removeItem(DEMO_KEYS.currentUser);
  };

  const addXP = useCallback((amount: number) => {
    if (amount === 0) return;
    let applied = false;
    let oldLevel = 1;
    let newLevel = 1;
    setUser((prev) => {
      if (!prev) return prev;
      applied = true;
      oldLevel = levelFromTotalXp(prev.xp);
      const newXp = prev.xp + amount;
      newLevel = levelFromTotalXp(newXp);
      return { ...prev, xp: newXp, level: newLevel };
    });
    queueMicrotask(() => {
      if (!applied) return;
      toast.success(`+${amount} XP!`);
      if (newLevel > oldLevel) {
        toast.success(`Level up! You are now level ${newLevel}.`);
      }
    });
  }, []);

  const addCoins = useCallback((amount: number) => {
    let applied = false;
    setUser((prev) => {
      if (!prev) return prev;
      applied = true;
      return { ...prev, coins: Math.max(0, prev.coins + amount) };
    });
    if (amount > 0) {
      queueMicrotask(() => {
        if (applied) toast.success(`+${amount} coins!`);
      });
    }
  }, []);

  const completeTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.completed || !user) return;

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t)));
    addXP(task.xpReward);
    addCoins(task.coinsReward);
  };

  const unlockBrainrot = useCallback((brainrotId: string) => {
    let nextBrainrots: Brainrot[] | null = null;
    setUser((prev) => {
      if (!prev) return prev;
      const def = BRAINROT_CATALOG_BASE.find((b) => b.id === brainrotId);
      if (!def) return prev;
      const existing = prev.brainrots ?? [];
      const found = existing.find((b) => b.id === brainrotId);
      if (found) {
        nextBrainrots = existing.map((b) => 
          b.id === brainrotId ? { ...b, count: b.count + 1 } : b
        );
      } else {
        nextBrainrots = [...existing, { ...def, unlocked: true, count: 1 }];
      }
      return { ...prev, brainrots: nextBrainrots };
    });
    queueMicrotask(() => {
      if (!nextBrainrots) return;
      setBrainrots(
        initialBrainrots.map((b) => {
          const brData = nextBrainrots!.find((u) => u.id === b.id);
          return {
            ...b,
            unlocked: brData?.unlocked ?? false,
            count: brData?.count ?? 0,
          };
        })
      );
    });
  }, []);

  const addDeck = (deck: StoredDeck) => {
    setDecks((prev) => [...prev, sanitizeStoredDeck(deck)]);
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
