import { z } from "zod";

// One item a reward gives: its id in the game's tables, and the least and most of it a claim may draw. A least of zero is
// A roll that may give nothing, as a reward preview's range spells it
export interface RewardItem {
  itemId: number;
  maxCount: number;
  minCount: number;
}

export const rewardItemSchema = z.object({
  itemId: z.int().positive(),
  maxCount: z.int().positive(),
  minCount: z.int().nonnegative(),
}) satisfies z.ZodType<RewardItem>;
