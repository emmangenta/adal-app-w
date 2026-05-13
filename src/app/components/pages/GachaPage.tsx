import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { Gift, Coins, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

const ROLL_COST = 10;

export function GachaPage() {
  const { user, addCoins, brainrots, unlockBrainrot } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState<{
    id: string;
    name: string;
    rarity: string;
    image: string;
  } | null>(null);

  if (!user) return null;

  const lockedBrainrots = brainrots.filter((b) => !b.unlocked);

  const handleSpin = () => {
    if (user.coins < ROLL_COST) {
      toast.error(`Not enough coins! Need ${ROLL_COST} coins to roll.`);
      return;
    }

    addCoins(-ROLL_COST);
    setIsSpinning(true);
    setReward(null);

    setTimeout(() => {
      const random = Math.random();
      let selectedBrainrot;

      if (lockedBrainrots.length === 0) {
        toast.success("You've collected everything! Here's a coin bonus.");
        addCoins(15);
        setIsSpinning(false);
        return;
      }

      if (random < 0.5) {
        const commonBrainrots = lockedBrainrots.filter((b) => b.rarity === "common");
        selectedBrainrot = commonBrainrots[Math.floor(Math.random() * commonBrainrots.length)];
      } else if (random < 0.8) {
        const rareBrainrots = lockedBrainrots.filter((b) => b.rarity === "rare");
        selectedBrainrot =
          rareBrainrots[Math.floor(Math.random() * rareBrainrots.length)] ||
          lockedBrainrots[0];
      } else if (random < 0.95) {
        const epicBrainrots = lockedBrainrots.filter((b) => b.rarity === "epic");
        selectedBrainrot =
          epicBrainrots[Math.floor(Math.random() * epicBrainrots.length)] ||
          lockedBrainrots[0];
      } else {
        const legendaryBrainrots = lockedBrainrots.filter((b) => b.rarity === "legendary");
        selectedBrainrot =
          legendaryBrainrots[Math.floor(Math.random() * legendaryBrainrots.length)] ||
          lockedBrainrots[0];
      }

      if (selectedBrainrot) {
        unlockBrainrot(selectedBrainrot.id);
        setReward(selectedBrainrot);
        setIsSpinning(false);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast.success(`Unlocked: ${selectedBrainrot.name}!`, {
          icon: selectedBrainrot.image,
        });
      }
    }, 2000);
  };

  const rarityColors = {
    common: "text-gray-600 bg-gray-500/10 border-gray-500/20",
    rare: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    epic: "text-purple-600 bg-purple-500/10 border-purple-500/20",
    legendary: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mystery Box</h1>
        <p className="text-muted-foreground">
          Spend your coins to unlock collectible Brainrots!
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
          <CardDescription>Each roll costs {ROLL_COST} coins</CardDescription>
        </CardHeader>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-12">
          <div className="flex flex-col items-center gap-8">
            <AnimatePresence mode="wait">
              {isSpinning ? (
                <motion.div
                  key="spinning"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, rotate: 360 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.5, rotate: { duration: 2, repeat: Infinity, ease: "linear" } }}
                  className="size-48 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center"
                >
                  <Gift className="size-24 text-white" />
                </motion.div>
              ) : reward ? (
                <motion.div
                  key="reward"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-center space-y-4"
                >
                  <div className="text-9xl">{reward.image}</div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{reward.name}</h3>
                    <div
                      className={`inline-flex px-4 py-1 rounded-full border ${
                        rarityColors[reward.rarity as keyof typeof rarityColors]
                      }`}
                    >
                      <span className="font-medium capitalize">{reward.rarity}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="size-48 rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 border-2 border-dashed border-border flex items-center justify-center"
                >
                  <Gift className="size-24 text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={handleSpin}
              disabled={isSpinning || user.coins < ROLL_COST}
              size="lg"
              className="gap-2 min-w-48"
            >
              {isSpinning ? (
                <>
                  <Sparkles className="size-5 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <Gift className="size-5" />
                  Open Box ({ROLL_COST} coins)
                </>
              )}
            </Button>

            {user.coins < ROLL_COST && (
              <p className="text-sm text-muted-foreground">
                Not enough coins. Complete tasks to earn more!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rarity Rates</CardTitle>
          <CardDescription>Chance of getting each rarity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
            <span className="font-medium">Common</span>
            <span className="text-sm text-muted-foreground">50%</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span className="font-medium">Rare</span>
            <span className="text-sm text-muted-foreground">30%</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <span className="font-medium">Epic</span>
            <span className="text-sm text-muted-foreground">15%</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="font-medium">Legendary</span>
            <span className="text-sm text-muted-foreground">5%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
