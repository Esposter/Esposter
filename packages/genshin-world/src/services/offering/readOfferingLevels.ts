import type { OfferingKind } from "#src/models/offering/OfferingKind";
import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

import { offeringLevelItemSchema } from "#src/models/offering/OfferingLevelItem";
import { offeringRewardSchema } from "#src/models/offering/OfferingReward";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// A level as `pnpm -C scripts genshin:assets offerings` publishes it: the items it takes, each kind with its count, and
// Its Fixed rewards. A level paying a pool is refused as the data is read, since the rule pays fixed rewards only
const publishedLevelSchema = z.object({
  items: z.array(offeringLevelItemSchema),
  level: z.int().positive(),
  reward: z.object({ kind: z.literal("fixed"), rewards: z.array(offeringRewardSchema) }),
});

// An offering's levels `pnpm -C scripts genshin:assets offerings` publishes under its kind, fetched by their key from
// The Hosted game data and checked against their shape as they arrive, then read as the rule's levels
export const readOfferingLevels = async (
  gameDataBaseUrl: string,
  offeringKind: OfferingKind,
): Promise<OfferingLevel[]> => {
  const levels = await readGameData(gameDataBaseUrl, `offerings/${offeringKind}`, z.array(publishedLevelSchema));
  return levels.map(({ items, level, reward }) => ({ items, level, rewards: reward.rewards }));
};
