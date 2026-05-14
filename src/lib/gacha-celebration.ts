import confetti from "canvas-confetti";
import type { BrainrotRarity } from "@/lib/brainrot-catalog";

/** Tier-matched pull celebration (secret = strongest). */
export function firePullCelebration(rarity: BrainrotRarity) {
  const base = { origin: { y: 0.62 } as const };

  switch (rarity) {
    case "common":
      confetti({
        ...base,
        particleCount: 28,
        spread: 42,
        ticks: 90,
        gravity: 1.05,
        colors: ["#94a3b8", "#cbd5e1", "#64748b"],
      });
      break;
    case "rare":
      confetti({
        ...base,
        particleCount: 45,
        spread: 55,
        ticks: 110,
        gravity: 1,
        colors: ["#60a5fa", "#38bdf8", "#818cf8"],
      });
      break;
    case "epic":
      confetti({
        ...base,
        particleCount: 65,
        spread: 62,
        ticks: 130,
        gravity: 0.95,
        colors: ["#a855f7", "#c084fc", "#e879f9"],
      });
      break;
    case "legendary":
      confetti({
        ...base,
        particleCount: 85,
        spread: 68,
        ticks: 150,
        gravity: 0.9,
        colors: ["#f59e0b", "#fbbf24", "#fcd34d"],
      });
      confetti({
        particleCount: 40,
        spread: 100,
        startVelocity: 35,
        scalar: 1.1,
        colors: ["#f59e0b"],
        origin: { x: 0.15, y: 0.55 },
      });
      confetti({
        particleCount: 40,
        spread: 100,
        startVelocity: 35,
        scalar: 1.1,
        colors: ["#f59e0b"],
        origin: { x: 0.85, y: 0.55 },
      });
      break;
    case "mythic":
      confetti({
        ...base,
        particleCount: 110,
        spread: 75,
        ticks: 180,
        gravity: 0.85,
        colors: ["#22d3ee", "#06b6d4", "#14b8a6"],
      });
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 70,
        origin: { x: 0, y: 0.65 },
        colors: ["#22d3ee"],
      });
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 70,
        origin: { x: 1, y: 0.65 },
        colors: ["#14b8a6"],
      });
      break;
    case "brainrot_god":
      confetti({
        ...base,
        particleCount: 140,
        spread: 85,
        ticks: 220,
        gravity: 0.75,
        scalar: 1.15,
        colors: ["#ef4444", "#f97316", "#eab308", "#a855f7"],
      });
      const endGod = Date.now() + 2200;
      const burstGod = () => {
        confetti({
          particleCount: 25,
          spread: 360,
          ticks: 200,
          scalar: 1.2,
          origin: { x: Math.random(), y: Math.random() * 0.4 },
          colors: ["#ef4444", "#fbbf24"],
        });
        if (Date.now() < endGod) requestAnimationFrame(burstGod);
      };
      burstGod();
      break;
    case "secret":
      {
      const duration = 3800;
      const end = Date.now() + duration;
      const colors = ["#FFD700", "#FFF8DC", "#FF1493", "#00FFFF", "#ADFF2F"];
      const burst = () => {
        confetti({
          particleCount: 10,
          angle: 60,
          spread: 75,
          origin: { x: 0, y: 0.58 },
          colors,
          scalar: 1.25,
        });
        confetti({
          particleCount: 10,
          angle: 120,
          spread: 75,
          origin: { x: 1, y: 0.58 },
          colors,
          scalar: 1.25,
        });
        confetti({
          particleCount: 14,
          spread: 120,
          ticks: 250,
          gravity: 0.65,
          origin: { x: 0.5, y: 0.35 },
          colors,
          scalar: 1.35,
        });
        if (Date.now() < end) requestAnimationFrame(burst);
      };
      burst();
      }
      break;
    default:
      confetti({ ...base, particleCount: 30, spread: 50 });
  }
}
