import type { ReputationReward } from "#src/models/reputation/ReputationReward";

import { reputationRewardSchema } from "#src/models/reputation/ReputationReward";
import { z } from "zod";

// One threshold of a nation's exploration: the percentage of it that reaching pays its reward, once
export interface ReputationExplore {
  exploreId: number;
  exploreProgress: number;
  reward: ReputationReward;
}

export const reputationExploreSchema = z.object({
  exploreId: z.int().positive(),
  exploreProgress: z.int().min(1).max(100),
  reward: reputationRewardSchema,
}) satisfies z.ZodType<ReputationExplore>;
