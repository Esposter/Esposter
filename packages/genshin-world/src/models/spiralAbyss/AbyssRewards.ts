import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { AbyssFloorReward } from "#src/models/spiralAbyss/AbyssFloorReward";

import { abyssFloorRewardSchema } from "#src/models/spiralAbyss/AbyssFloorReward";
import { z } from "zod";

// The Spiral Abyss's rewards: each floor's rewards in every reward group, and the items each reward id they name pays, keyed
// By the reward id as the record writes it. A claim gives the items of the reward ids a clear gives, never the ids themselves
export interface AbyssRewards {
  floorRewards: AbyssFloorReward[];
  rewardItems: Record<string, DroppedItem[]>;
}

export const abyssRewardsSchema = z.object({
  floorRewards: z.array(abyssFloorRewardSchema),
  rewardItems: z.record(
    z.string().regex(/^\d+$/u),
    z.array(z.object({ count: z.int().positive(), itemId: z.int().positive() })),
  ),
}) satisfies z.ZodType<AbyssRewards>;
