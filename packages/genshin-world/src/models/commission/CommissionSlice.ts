import type { Commission } from "#src/models/commission/Commission";
import type { CommissionRewardTier } from "#src/models/commission/CommissionRewardTier";
import type { RewardItem } from "#src/models/reward/RewardItem";

import { commissionSchema } from "#src/models/commission/Commission";
import { commissionRewardTierSchema } from "#src/models/commission/CommissionRewardTier";
import { rewardItemSchema } from "#src/models/reward/RewardItem";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// Mondstadt's daily tasks as the slice `pnpm -C scripts genshin:assets commissions` writes: each task, the reward tiers by
// Adventure Rank band, and the items Katheryne's bonus gives for each band
export interface CommissionSlice {
  bonuses: RewardItem[][];
  rewardTiers: CommissionRewardTier[];
  tasks: Commission[];
}

export const commissionSliceSchema = z.object({
  bonuses: z.array(z.array(rewardItemSchema)),
  rewardTiers: z.array(commissionRewardTierSchema),
  tasks: createUniqueArraySchema(commissionSchema, "id"),
}) satisfies z.ZodType<CommissionSlice>;
