"use client";

import Image from "next/image";
import { useApp } from "../../context/AppContext";
import type { Brainrot } from "../../context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Lock } from "lucide-react";
import { motion } from "motion/react";
import { formatRarityLabel } from "@/lib/brainrot-catalog";

export function CollectionPage() {
  const { brainrots } = useApp();

  const unlockedCount = brainrots.filter((b) => b.unlocked).length;
  const totalCount = brainrots.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  const rarityColors: Record<string, string> = {
    common: "bg-gray-500/20 border-gray-500/50 text-gray-600 dark:text-gray-400",
    rare: "bg-blue-500/20 border-blue-500/50 text-blue-600 dark:text-blue-400",
    epic: "bg-purple-500/20 border-purple-500/50 text-purple-600 dark:text-purple-400",
    legendary: "bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-400",
    mythic: "bg-cyan-500/20 border-cyan-500/50 text-cyan-600 dark:text-cyan-400",
    brainrot_god: "bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-400",
    secret: "bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-600 dark:text-fuchsia-400",
  };

  const filterByRarity = (rarity: Brainrot["rarity"]) => brainrots.filter((b) => b.rarity === rarity);

  const ultraBrainrots = brainrots.filter((b) =>
    ["mythic", "brainrot_god", "secret"].includes(b.rarity)
  );

  const allBrainrots = brainrots;
  const commonBrainrots = filterByRarity("common");
  const rareBrainrots = filterByRarity("rare");
  const epicBrainrots = filterByRarity("epic");
  const legendaryBrainrots = filterByRarity("legendary");

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Brainrot Collection</h1>
        <p className="text-muted-foreground">Your collection of unlocked items</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collection Progress</CardTitle>
          <CardDescription>
            {unlockedCount} of {totalCount} items collected ({completionPercentage}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList className="flex h-auto w-full max-w-full flex-wrap gap-1 overflow-x-auto pb-1">
          <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
          <TabsTrigger value="common">Common ({commonBrainrots.length})</TabsTrigger>
          <TabsTrigger value="rare">Rare ({rareBrainrots.length})</TabsTrigger>
          <TabsTrigger value="epic">Epic ({epicBrainrots.length})</TabsTrigger>
          <TabsTrigger value="legendary">Legendary ({legendaryBrainrots.length})</TabsTrigger>
          <TabsTrigger value="ultra">
            Ultra ({ultraBrainrots.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <BrainrotGrid brainrots={allBrainrots} rarityColors={rarityColors} />
        </TabsContent>

        <TabsContent value="common" className="mt-6">
          <BrainrotGrid brainrots={commonBrainrots} rarityColors={rarityColors} />
        </TabsContent>

        <TabsContent value="rare" className="mt-6">
          <BrainrotGrid brainrots={rareBrainrots} rarityColors={rarityColors} />
        </TabsContent>

        <TabsContent value="epic" className="mt-6">
          <BrainrotGrid brainrots={epicBrainrots} rarityColors={rarityColors} />
        </TabsContent>

        <TabsContent value="legendary" className="mt-6">
          <BrainrotGrid brainrots={legendaryBrainrots} rarityColors={rarityColors} />
        </TabsContent>

        <TabsContent value="ultra" className="mt-6">
          <BrainrotGrid brainrots={ultraBrainrots} rarityColors={rarityColors} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BrainrotGrid({
  brainrots,
  rarityColors,
}: {
  brainrots: Brainrot[];
  rarityColors: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {brainrots.map((brainrot, index) => (
        <motion.div
          key={brainrot.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
        >
          <Card
            className={`
              relative overflow-hidden transition-all hover:scale-105
              ${brainrot.unlocked ? "cursor-pointer" : "opacity-50"}
            `}
          >
            <CardContent className="p-6 flex flex-col items-center gap-3">
              {brainrot.unlocked ? (
                <>
                  {brainrot.image.startsWith("/") ? (
                    <div className="relative size-24">
                      <Image
                        src={brainrot.image}
                        alt=""
                        fill
                        className="object-contain"
                        sizes="96px"
                      />
                    </div>
                  ) : (
                    <div className="text-6xl">{brainrot.image}</div>
                  )}
                  <div className="text-center space-y-1">
                    <p className="font-medium text-sm">{brainrot.name}</p>
                    <Badge
                      variant="outline"
                      className={`${rarityColors[brainrot.rarity] ?? rarityColors.epic}`}
                    >
                      {formatRarityLabel(brainrot.rarity)}
                    </Badge>
                    {brainrot.count > 0 && (
                      <p className="text-xs text-muted-foreground">×{brainrot.count}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="size-8 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-medium text-sm text-muted-foreground">Locked</p>
                    <Badge
                      variant="outline"
                      className={`${rarityColors[brainrot.rarity] ?? rarityColors.epic}`}
                    >
                      {formatRarityLabel(brainrot.rarity)}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
