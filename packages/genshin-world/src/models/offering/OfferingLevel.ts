import type { OfferingReward } from "#src/models/offering/OfferingReward";

import { offeringRewardSchema } from "#src/models/offering/OfferingReward";
import { z } from "zod";

// One level of an offering, from the game's level-up table: the items it takes off the held count, the item they are,
// And the rewards it pays. Level 1 takes no items and is paid when the offering starts
export interface OfferingLevel {
  itemCount: number;
  itemId: number;
  level: number;
  rewards: OfferingReward[];
}

export const offeringLevelSchema = z.object({
  itemCount: z.int().nonnegative(),
  itemId: z.int().nonnegative(),
  level: z.int().positive(),
  rewards: z.array(offeringRewardSchema),
}) satisfies z.ZodType<OfferingLevel>;
