import type { Commission } from "#src/models/commission/Commission";
import type { CommissionRewardTier } from "#src/models/commission/CommissionRewardTier";
import type { RewardItem } from "#src/models/reward/RewardItem";

import { commissionSchema } from "#src/models/commission/Commission";
import { commissionRewardTierSchema } from "#src/models/commission/CommissionRewardTier";
import { rewardItemSchema } from "#src/models/reward/RewardItem";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// One region's daily tasks as the slice `pnpm -C scripts genshin:assets commissions` writes: each task, the reward tiers by
// Adventure Rank band, the items Katheryne's bonus gives for each band, and the main quest the region's city opens with,
// Which its tasks join the deal once is done. A region no quest is named for has none, so its tasks join as they are read
export interface CommissionSlice {
  bonuses: RewardItem[][];
  openingQuestId?: number;
  rewardTiers: CommissionRewardTier[];
  tasks: Commission[];
}

export const commissionSliceSchema = z.object({
  bonuses: z.array(z.array(rewardItemSchema)),
  openingQuestId: z.int().positive().optional(),
  rewardTiers: z.array(commissionRewardTierSchema),
  tasks: createUniqueArraySchema(commissionSchema, "id"),
}) satisfies z.ZodType<CommissionSlice>;
