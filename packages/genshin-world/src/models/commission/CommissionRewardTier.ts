import type { RewardItem } from "#src/models/reward/RewardItem";

import { rewardItemSchema } from "#src/models/reward/RewardItem";
import { z } from "zod";

// One reward tier a commission pays from, its items for each Adventure Rank band in turn, from the lowest band
export interface CommissionRewardTier {
  bands: RewardItem[][];
  tier: number;
}

export const commissionRewardTierSchema = z.object({
  bands: z.array(z.array(rewardItemSchema)),
  tier: z.int().positive(),
}) satisfies z.ZodType<CommissionRewardTier>;
