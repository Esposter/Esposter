import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

import { offeringLevelItemSchema } from "#src/models/offering/OfferingLevel";
import { offeringRewardSchema } from "#src/models/offering/OfferingReward";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// A level as `pnpm -C scripts genshin:assets offerings` publishes it: the items it takes, each kind with its count, and its
// Fixed rewards. A level paying a pool is refused as the data is read, since the rule pays fixed rewards only
const publishedLevelSchema = z.object({
  items: z.array(offeringLevelItemSchema),
  level: z.int().positive(),
  reward: z.object({ kind: z.literal("fixed"), rewards: z.array(offeringRewardSchema) }),
});

// The Frostbearing Tree's levels `pnpm -C scripts genshin:assets offerings` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives, then read as the rule's levels
export const readFrostbearingTreeLevels = async (gameDataBaseUrl: string): Promise<OfferingLevel[]> => {
  const levels = await readGameData(gameDataBaseUrl, "offerings/frostbearingTree", z.array(publishedLevelSchema));
  return levels.map(({ items, level, reward }) => ({ items, level, rewards: reward.rewards }));
};
