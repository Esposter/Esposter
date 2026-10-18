import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

import { offeringRewardSchema } from "#src/models/offering/OfferingReward";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// A level as `pnpm -C scripts genshin:assets offerings` publishes it: the items it takes. The offer rule holds one item at
// A time, so a level naming more than one is refused as the data is read, until the rule holds each item
const publishedLevelSchema = z.object({
  items: z.array(z.object({ itemCount: z.int().positive(), itemId: z.int().positive() })).max(1),
  level: z.int().positive(),
  rewards: z.array(offeringRewardSchema),
});

// The Frostbearing Tree's levels `pnpm -C scripts genshin:assets offerings` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives, then read as the rule's levels
export const readFrostbearingTreeLevels = async (gameDataBaseUrl: string): Promise<OfferingLevel[]> => {
  const levels = await readGameData(gameDataBaseUrl, "offerings/frostbearingTree", z.array(publishedLevelSchema));
  return levels.map(({ items, level, rewards }) => {
    const [item] = items;
    return { itemCount: item?.itemCount ?? 0, itemId: item?.itemId ?? 0, level, rewards };
  });
};
