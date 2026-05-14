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
  common: 67,
  rare: 30,
  epic: 15,
  legendary: 2,
  mythic: 0.67,
  brainrot_god: 0.067,
  secret: 0.0067,
};

const COMMON_NAMES = [
  "Skibidi Scholar",
  "Ohio Oracle",
  "Mewing Maven",
  "Bio Baddie",
  "Mitochondria Menace",
  "ATP Goblin",
  "Cell Wall Chad",
  "Phloem Phantom",
  "Golgi Grindset",
  "Lysosome Legend",
  "Ribosome Rizz",
  "Vacuole Vandal",
  "Chloroplast Chud",
  "Nucleus Nerd",
  "Enzyme Emperor",
];

const RARE_NAMES = [
  "Rizzler Rex",
  "Gyatt Golem",
  "Aura Farmer",
  "Fanum Taxinator",
  "Sigma Skeleton",
  "Cap No Capper",
  "Based Blob",
  "Glizzy Gladiator",
  "Clavicle Clown",
  "Cortex Crusader",
  "Dendrite Demon",
  "Axon Assassin",
];

const EPIC_NAMES = [
  "Grimace Giga-Chad",
  "Baby Gronkulus",
  "Tax Fraud Turtle",
  "Ohio Final Boss",
  "Skibidi Toilet Titan",
  "Rizzquake",
  "Gyatt Laser",
  "Fanum Feast",
  "Sigma Singularity",
  "Mythic Mewer",
];

const LEGENDARY_NAMES = [
  "Capstone No-Cap",
  "Galaxy Goblin",
  "Chromosome Chad",
  "Evolution Emperor",
  "Taxonomy Tyrant",
  "Ecosystem Eldritch",
];

const MYTHIC_NAMES = ["Helix Horror", "Darwin's Demon", "Quantum Quokka"];

const GOD_NAMES = ["Brainrot Overlord", "Primordial Pepe"];

const SECRET_NAMES = ["The Forbidden Fold"];

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
  "secret",
  "brainrot_god",
  "mythic",
  "legendary",
  "epic",
  "rare",
  "common",
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
      return "Legend";
    case "legendary":
      return "Ultra";
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
