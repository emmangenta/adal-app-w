/** Browser-only keys for Vercel-friendly demo persistence (no server DB). */

export const DEMO_KEYS = {
  currentUser: "adal_demo_appUser",
  usersRegistry: "adal_demo_appUsers",
  /** @deprecated Large decks moved to IndexedDB; kept only for one-time migration. */
  decksForUser: (userId: string) => `adal_demo_decks_${userId}`,
  /** Ordered deck ids; full `StoredDeck` payloads live in IndexedDB. */
  deckIdsForUser: (userId: string) => `adal_demo_deckIds_${userId}`,
  tasksForUser: (userId: string) => `adal_demo_tasks_${userId}`,
} as const;
