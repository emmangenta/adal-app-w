/** Browser-only keys for Vercel-friendly demo persistence (no server DB). */

export const DEMO_KEYS = {
  currentUser: "adal_demo_appUser",
  usersRegistry: "adal_demo_appUsers",
  decksForUser: (userId: string) => `adal_demo_decks_${userId}`,
  tasksForUser: (userId: string) => `adal_demo_tasks_${userId}`,
} as const;
