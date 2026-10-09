import type { ReputationReward } from "#src/models/reputation/ReputationReward";

import { reputationRewardSchema } from "#src/models/reputation/ReputationReward";
import { z } from "zod";

// One level of a nation's Reputation as the game's table gives it: the EXP it needs to reach the next, zero at a nation's
// Last level, the reward reaching it pays, the unlock functions and shop goods it opens, and the request group its keeper
// Offers from it
export interface ReputationLevel {
  functionIds: number[];
  goodsIds: number[];
  level: number;
  nextLevelExp: number;
  requestGroupId: number;
  reward: ReputationReward;
}

export const reputationLevelSchema = z.object({
  functionIds: z.array(z.int().positive()),
  goodsIds: z.array(z.int().positive()),
  level: z.int().positive(),
  nextLevelExp: z.int().nonnegative(),
  requestGroupId: z.int().positive(),
  reward: reputationRewardSchema,
}) satisfies z.ZodType<ReputationLevel>;
