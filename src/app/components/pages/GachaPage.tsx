"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useApp } from "../../context/AppContext";
import type { Brainrot } from "../../context/AppContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { Gift, Coins, Sparkles } from "lucide-react";
import {
  pickLockedBrainrotWeighted,
  formatRarityLabel,
  BRAINROT_TIER_WEIGHTS,
  type BrainrotRarity,
} from "@/lib/brainrot-catalog";
import { firePullCelebration } from "@/lib/gacha-celebration";
import { gachaRevealFrameClass, gachaSlotFrameClass } from "@/lib/brainrot-rarity-frame";

const ROLL_COST = 10;
const WIN_INDEX = 42;
const REEL_LEN = 55;
const SLOT_PX = 140;
/** Must match reel row: gap-2 (8px) between slots */
const REEL_GAP_PX = 8;
/** Must match reel row: px-2 horizontal padding inside the translated strip */
const REEL_PAD_PX = 8;
const SPIN_MS = 4800;

function buildReel(winner: Brainrot, pool: Brainrot[]): Brainrot[] {
  const strip: Brainrot[] = [];
  for (let i = 0; i < REEL_LEN; i++) {
    if (i === WIN_INDEX) strip.push(winner);
    else strip.push(pool[Math.floor(Math.random() * pool.length)]!);
  }
  return strip;
}

function isArtPath(image: string) {
  return image.startsWith("/");
}

function viewportAccent(
  rarity: BrainrotRarity | undefined,
  phase: "idle" | "rolling" | "revealed"
): string {
  if (phase !== "rolling" || !rarity) return "border-amber-500/40 shadow-inner";
  switch (rarity) {
    case "common":
      return "border-slate-500/50 shadow-[inset_0_0_24px_rgba(148,163,184,0.25)]";
    case "rare":
      return "border-blue-400/60 shadow-[inset_0_0_28px_rgba(59,130,246,0.35)]";
    case "epic":
      return "border-purple-400/70 shadow-[inset_0_0_32px_rgba(168,85,247,0.45)]";
    case "legendary":
      return "border-orange-500 shadow-[inset_0_0_36px_rgba(249,115,22,0.45)]";
    case "mythic":
      return "border-yellow-400/80 shadow-[inset_0_0_40px_rgba(0,0,0,0.45)]";
    case "brainrot_god":
      return "border-white/30 shadow-[0_0_52px_rgba(168,85,247,0.45),0_0_52px_rgba(234,179,8,0.25),inset_0_0_48px_rgba(59,130,246,0.2)]";
    case "secret":
      return "border-neutral-200 shadow-[inset_0_0_48px_rgba(0,0,0,0.55),0_0_40px_rgba(255,255,255,0.2)]";
    default:
      return "border-amber-500/40";
  }
}

function needleGlow(rarity: BrainrotRarity | undefined, phase: "idle" | "rolling" | "revealed"): string {
  if (phase !== "rolling" || !rarity) return "bg-amber-500/90 shadow-[0_0_18px_rgba(245,158,11,0.9)]";
  switch (rarity) {
    case "secret":
      return "bg-gradient-to-b from-white via-neutral-400 to-black shadow-[0_0_24px_rgba(255,255,255,0.85)]";
    case "brainrot_god":
      return "bg-[linear-gradient(180deg,#ef4444,#f97316,#eab308,#22c55e,#3b82f6,#a855f7)] shadow-[0_0_28px_rgba(168,85,247,0.95)]";
    case "mythic":
      return "bg-gradient-to-b from-yellow-300 to-black shadow-[0_0_22px_rgba(234,179,8,0.95)]";
    case "legendary":
      return "bg-orange-400 shadow-[0_0_22px_rgba(249,115,22,0.95)]";
    default:
      return "bg-amber-500/90 shadow-[0_0_18px_rgba(245,158,11,0.9)]";
  }
}

export function GachaPage() {
  const { user, addCoins, brainrots, unlockBrainrot } = useApp();
  const [phase, setPhase] = useState<"idle" | "rolling" | "revealed">("idle");
  const [strip, setStrip] = useState<Brainrot[]>([]);
  const [winner, setWinner] = useState<Brainrot | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [spinDurationMs, setSpinDurationMs] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);
  const winnerRef = useRef<Brainrot | null>(null);
  phaseRef.current = phase;

  const lockedBrainrots = brainrots.filter((b) => !b.unlocked);

  const finalizeRoll = useCallback(
    (w: Brainrot) => {
      firePullCelebration(w.rarity as BrainrotRarity);
      unlockBrainrot(w.id);
      toast.success(`Unlocked: ${w.name}!`, {
        icon: isArtPath(w.image) ? (
          <Image src={w.image} alt="" width={28} height={28} className="rounded-md object-cover" />
        ) : (
          <span className="text-xl">{w.image}</span>
        ),
      });
      setPhase("revealed");
    },
    [unlockBrainrot]
  );

  const handleSpin = () => {
    if (!user) return;
    if (phase === "rolling") return;

    if (lockedBrainrots.length === 0) {
      toast.success("You've collected everything! Here's a coin bonus.");
      addCoins(15);
      return;
    }

    if (user.coins < ROLL_COST) {
      toast.error(`Not enough coins! Need ${ROLL_COST} coins to roll.`);
      return;
    }

    const w = pickLockedBrainrotWeighted(lockedBrainrots);
    if (!w) return;

    addCoins(-ROLL_COST);
    const reel = buildReel(w, brainrots);
    winnerRef.current = w;
    setWinner(w);
    setStrip(reel);
    setTranslateX(0);
    setSpinDurationMs(0);
    setPhase("rolling");
  };

  useLayoutEffect(() => {
    if (phase !== "rolling" || strip.length === 0) return;
    const el = viewportRef.current;
    const w = el?.clientWidth ?? 360;
    const slotStride = SLOT_PX + REEL_GAP_PX;
    const winCenterX = REEL_PAD_PX + WIN_INDEX * slotStride + SLOT_PX / 2;
    const target = w / 2 - winCenterX;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSpinDurationMs(SPIN_MS);
        setTranslateX(target);
      });
    });
  }, [phase, strip]);

  useEffect(() => {
    if (phase !== "revealed") return;
    const t = window.setTimeout(() => {
      setPhase("idle");
      setStrip([]);
      setWinner(null);
      winnerRef.current = null;
      setTranslateX(0);
      setSpinDurationMs(0);
    }, 3200);
    return () => window.clearTimeout(t);
  }, [phase]);

  const onReelTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== "transform") return;
    if (phaseRef.current !== "rolling") return;
    const w = winnerRef.current;
    if (!w) return;
    finalizeRoll(w);
  };

  if (!user) return null;

  const rarityColors: Record<BrainrotRarity, string> = {
    common: "text-slate-700 bg-slate-500/10 border-slate-500/30",
    rare: "text-blue-600 bg-blue-500/10 border-blue-500/30",
    epic: "text-purple-600 bg-purple-500/10 border-purple-500/30",
    legendary: "text-orange-700 bg-orange-500/15 border-orange-500/50",
    mythic: "text-yellow-200 bg-gradient-to-r from-yellow-500/20 to-black/40 border border-yellow-500/40",
    brainrot_god:
      "text-white bg-[linear-gradient(90deg,#ef4444,#f97316,#eab308,#22c55e,#3b82f6,#a855f7)]/20 border border-white/30",
    secret: "text-neutral-100 bg-gradient-to-r from-white/25 to-black/50 border border-neutral-300/50",
  };

  const weightSum = Object.values(BRAINROT_TIER_WEIGHTS).reduce((a, b) => a + b, 0);
  const tierRateRows = (
    Object.entries(BRAINROT_TIER_WEIGHTS) as [BrainrotRarity, number][]
  ).map(([key, w]) => ({
    key,
    label: formatRarityLabel(key),
    pct: `${((w / weightSum) * 100).toFixed(3)}%`,
  }));

  const tierRowShell: Record<BrainrotRarity, string> = {
    common: "border-slate-500/25 bg-slate-500/10",
    rare: "border-blue-500/25 bg-blue-500/10",
    epic: "border-purple-500/25 bg-purple-500/10",
    legendary: "border-orange-500/40 bg-orange-500/10",
    mythic: "border-yellow-500/35 bg-gradient-to-r from-yellow-500/15 to-black/30",
    brainrot_god:
      "border-white/20 bg-[linear-gradient(90deg,rgba(239,68,68,0.12),rgba(234,179,8,0.12),rgba(59,130,246,0.12),rgba(168,85,247,0.12))]",
    secret: "border-neutral-300/30 bg-gradient-to-r from-white/10 to-black/25",
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-28">
      <div>
        <h1 className="text-3xl font-bold mb-2">Case Opening</h1>
        <p className="text-muted-foreground">
          Spend your hard earned coins to open cases and unlock collectible Brainrots! Each case has a chance to drop a new Brainrot for your collection, with rarer Brainrots being more elusive. GOLD, GOLD GOLD!
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Coins</span>
            <span className="text-amber-600 flex items-center gap-2">
              <Coins className="size-5" />
              {user.coins}
            </span>
          </CardTitle>
          <CardDescription>Each case costs {ROLL_COST} coins</CardDescription>
        </CardHeader>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <div
            ref={viewportRef}
            className={`relative h-72 rounded-xl border-2 bg-muted/40 overflow-hidden transition-[border-color,box-shadow] duration-500 ${viewportAccent(
              winner?.rarity as BrainrotRarity | undefined,
              phase
            )}`}
          >
            <div
              className={`pointer-events-none absolute inset-y-0 left-1/2 z-10 w-1 -translate-x-1/2 transition-colors duration-300 ${needleGlow(
                winner?.rarity as BrainrotRarity | undefined,
                phase
              )}`}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background to-transparent z-[5]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent z-[5]" />

            {phase === "rolling" && strip.length > 0 ? (
              <div
                className="absolute left-0 top-1/2 flex h-64 -translate-y-1/2 items-stretch gap-2 px-2 will-change-transform"
                style={{
                  transform: `translateX(${translateX}px)`,
                  transition:
                    spinDurationMs > 0
                      ? `transform ${spinDurationMs}ms cubic-bezier(0.08, 0.82, 0.12, 1)`
                      : "none",
                }}
                onTransitionEnd={onReelTransitionEnd}
              >
                {strip.map((b, i) => (
                  <div
                    key={`${b.id}-${i}`}
                    className={gachaSlotFrameClass(b.rarity as BrainrotRarity)}
                    style={{ width: SLOT_PX }}
                  >
                    <div className="flex h-full min-h-[9rem] flex-col items-center justify-center rounded-md bg-card p-2 text-center shadow-sm">
                      {isArtPath(b.image) ? (
                        <Image
                          src={b.image}
                          alt=""
                          width={96}
                          height={96}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <span className="text-6xl">{b.image}</span>
                      )}
                      <span className="mt-1 line-clamp-2 text-[10px] font-medium leading-tight">{b.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : phase === "revealed" && winner ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-2">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 animate-pulse rounded-3xl bg-amber-500/20 blur-xl" />
                  <div
                    className={`relative ${gachaRevealFrameClass(winner.rarity as BrainrotRarity)}`}
                  >
                    <div className="rounded-xl bg-card p-1 shadow-inner">
                      {isArtPath(winner.image) ? (
                        <Image
                          src={winner.image}
                          alt=""
                          width={180}
                          height={180}
                          className="rounded-lg object-cover shadow-lg"
                        />
                      ) : (
                        <span className="flex min-h-[180px] min-w-[180px] items-center justify-center text-9xl">
                          {winner.image}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-bold">{winner.name}</h3>
                  <div
                    className={`mt-2 inline-flex rounded-full border px-4 py-1 ${
                      rarityColors[winner.rarity as BrainrotRarity]
                    }`}
                  >
                    <span className="font-medium">{formatRarityLabel(winner.rarity as BrainrotRarity)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center gap-3 text-muted-foreground">
                <Gift className="size-10 opacity-60" />
                <span className="text-sm">Open a case to spin the reel</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={handleSpin}
              disabled={
                phase === "rolling" ||
                (lockedBrainrots.length > 0 && user.coins < ROLL_COST)
              }
              size="lg"
              className="gap-2 min-w-48"
            >
              {phase === "rolling" ? (
                <>
                  <Sparkles className="size-5 animate-spin" />
                  Rolling…
                </>
              ) : lockedBrainrots.length === 0 ? (
                <>
                  <Gift className="size-5" />
                  Claim bonus (+15 coins)
                </>
              ) : (
                <>
                  <Gift className="size-5" />
                  Open Case ({ROLL_COST} coins)
                </>
              )}
            </Button>
            {lockedBrainrots.length > 0 && user.coins < ROLL_COST && (
              <p className="text-sm text-muted-foreground">Not enough coins. Complete tasks to earn more!</p>
            )}
            {lockedBrainrots.length === 0 && (
              <p className="text-sm text-muted-foreground">Collection complete — tap for a small coin bonus.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rarity Rates</CardTitle>
          <CardDescription>Approximate drop weights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tierRateRows.map((row) => (
            <div
              key={row.key}
              className={`flex items-center justify-between rounded-lg border p-3 ${tierRowShell[row.key]}`}
            >
              <span className="font-medium">{row.label}</span>
              <span className="text-sm text-muted-foreground">{row.pct}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
