import type { BrainrotRarity } from "@/lib/brainrot-catalog";

function rarityPadClass(rarity: BrainrotRarity): string {
  switch (rarity) {
    case "secret":
      return "bg-gradient-to-br from-white via-neutral-400 to-black";
    case "brainrot_god":
      return "bg-[linear-gradient(90deg,#ef4444,#f97316,#eab308,#22c55e,#3b82f6,#a855f7,#ef4444)]";
    case "mythic":
      return "bg-gradient-to-br from-yellow-300 via-amber-500 to-black";
    case "legendary":
      return "bg-orange-500";
    case "epic":
      return "bg-purple-500";
    case "rare":
      return "bg-blue-500";
    case "common":
    default:
      return "bg-slate-500";
  }
}

/** Reel tile outer frame (2px); fixed width keeps scroll math stable. */
export function gachaSlotFrameClass(rarity: BrainrotRarity): string {
  return `shrink-0 rounded-lg p-[2px] h-full ${rarityPadClass(rarity)}`;
}

/** Larger frame for the revealed pull. */
export function gachaRevealFrameClass(rarity: BrainrotRarity): string {
  return `relative inline-block rounded-2xl p-[3px] ${rarityPadClass(rarity)}`;
}
