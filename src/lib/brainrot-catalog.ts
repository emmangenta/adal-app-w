/** Catalog definitions (no AppContext import). */

export type BrainrotRarity =
  | "common"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic"
  | "brainrot_god"
  | "secret";

export interface BrainrotCatalogEntry {
  id: string;
  name: string;
  rarity: BrainrotRarity;
  image: string;
}

/** Relative weights (normalized at roll time). Mirrors requested economy. */
export const BRAINROT_TIER_WEIGHTS: Record<BrainrotRarity, number> = {
  common: 50,
  rare: 30,
  epic: 12,
  legendary: 5,
  mythic: 2,
  brainrot_god: 0.5,
  secret: 0.05,
};

const COMMON_NAMES = [
  "Noobini Pizzanini",
  "Lirilì Larilà",
  "Tim Cheese",
  "Fluriflura",
  "Talpa Di Fero",
  "Svinina Bombardino",
  "Cocofanto Elefanto",
  "Pipi Kiwi",
  "Raccooni Jandelini",
  "Tartaragno",
  "Pipi Corni",
  "Holy Arepa",
  "Smurf Cat",
  "Skibidi Toilet",
  "John Pork",
];

const RARE_NAMES = [
  "Trippi Troppi",
  "Gangster Footera",
  "Bandito Bobritto",
  "Boneca Ambalabu",
  "Cacto Hipopotamo",
  "Ta Ta Ta Ta Sahur",
  "Tric Trac Baraboom",
  "Burbaloni Loliloli",
  "Chimpanzini Bananini",
  "Ballerina Cappuccina",
  "Blueberrinni Octopusini",
  "Cappuccino Assassino",
];

const EPIC_NAMES = [
  "Brr Brr Patapim",
  "Bombardilo Crocodilo",
  "Tralalero Tralala",
  "Tralalita Tralala",
  "Skibidi Toilet Titan",
  "Odin Din Din Dun",
  "La Vacca Saturno Saturnita",
  "Job Job Job Sahur",
  "Strawberry Elephant",
  "Bisonte Giupiterre",
];

const LEGENDARY_NAMES = [
  "Charlie Kirk",
  "Tatay Dihh",
  "SAY WALLAHI BRO",
  "The Ultimate Larper",
  "Tung Tung Tung Sahur",
  "Yakub",
];

const MYTHIC_NAMES = ["Clavicular", "Sophie Rain", "Adin Ross"];

const GOD_NAMES = ["P.Diddy", "Big Stein"];

const SECRET_NAMES = ["Big Ben Yahu"];

function pushTier(
  out: BrainrotCatalogEntry[],
  names: string[],
  rarity: BrainrotRarity,
  startId: number
) {
  let id = startId;
  for (const name of names) {
    out.push({
      id: String(id),
      name,
      rarity,
      image: `/brainrots/br-${id}.svg`,
    });
    id += 1;
  }
  return id;
}

const _catalog: BrainrotCatalogEntry[] = [];
let n = 1;
n = pushTier(_catalog, COMMON_NAMES, "common", n);
n = pushTier(_catalog, RARE_NAMES, "rare", n);
n = pushTier(_catalog, EPIC_NAMES, "epic", n);
n = pushTier(_catalog, LEGENDARY_NAMES, "legendary", n);
n = pushTier(_catalog, MYTHIC_NAMES, "mythic", n);
n = pushTier(_catalog, GOD_NAMES, "brainrot_god", n);
pushTier(_catalog, SECRET_NAMES, "secret", n);

export const BRAINROT_CATALOG_BASE: BrainrotCatalogEntry[] = _catalog;

const TIER_ORDER: BrainrotRarity[] = [
  "common",
  "rare",
  "epic",
  "legendary",
  "mythic",
  "brainrot_god",
  "secret",
];

export function pickWeightedTier(): BrainrotRarity {
  const entries = Object.entries(BRAINROT_TIER_WEIGHTS) as [BrainrotRarity, number][];
  const sum = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * sum;
  for (const [tier, w] of entries) {
    r -= w;
    if (r <= 0) return tier;
  }
  return "common";
}

/** Pick a locked brainrot using tier weights; falls down tiers if pool empty. */
export function pickLockedBrainrotWeighted<T extends { id: string; rarity: BrainrotRarity; unlocked: boolean }>(
  locked: T[]
): T | null {
  if (locked.length === 0) return null;
  const tier = pickWeightedTier();
  const inTier = locked.filter((b) => b.rarity === tier);
  if (inTier.length > 0) return inTier[Math.floor(Math.random() * inTier.length)]!;
  for (const t of TIER_ORDER) {
    const pool = locked.filter((b) => b.rarity === t);
    if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)]!;
  }
  return locked[0]!;
}

export function formatRarityLabel(rarity: BrainrotRarity): string {
  switch (rarity) {
    case "common":
      return "Common";
    case "rare":
      return "Rare";
    case "epic":
      return "Epic";
    case "legendary":
      return "Legendary";
    case "mythic":
      return "Mythic";
    case "brainrot_god":
      return "Brainrot God";
    case "secret":
      return "Secret";
    default:
      return rarity;
  }
}
