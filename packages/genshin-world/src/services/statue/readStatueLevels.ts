import type { GameDataKey } from "#src/models/data/GameDataKey";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { offeringRewardSchema } from "#src/models/offering/OfferingReward";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// A level as `pnpm -C scripts genshin:assets statues` publishes it: flat, its one Oculus and how many it takes, where a
// Level that takes none names an item of zero
const publishedStatueLevelSchema = z.object({
  itemCount: z.int().nonnegative(),
  itemId: z.int().nonnegative(),
  level: z.int().positive(),
  rewards: z.array(offeringRewardSchema),
  staminaShare: z.int().nonnegative(),
});

// A region's statue levels `pnpm -C scripts genshin:assets statues` publishes, fetched by its key from the hosted game
// Data and checked against its shape as it arrives, then read as the rule's levels: a level takes its one Oculus, or none.
// The key is typed off the lock, so a region no publish wrote fails typecheck
export const readStatueLevels = async (
  gameDataBaseUrl: string,
  key: Extract<GameDataKey, `statueLevels/${string}`>,
): Promise<StatueLevel[]> => {
  const levels = await readGameData(gameDataBaseUrl, key, z.array(publishedStatueLevelSchema));
  return levels.map(({ itemCount, itemId, level, rewards, staminaShare }) => ({
    items: itemCount > 0 ? [{ itemCount, itemId }] : [],
    level,
    rewards,
    staminaShare,
  }));
};
