import { z } from "zod";

// One item a reward gives: its id in the game's tables, and the least and most of it a claim may draw. A least of zero is
// A roll that may give nothing, as a reward preview's range spells it. An average, where the wiki gives one, is the count a
// Claim draws to on average, and an item with one is drawn to that mean (see drawRewardItems)
export interface RewardItem {
  averageCount?: number;
  itemId: number;
  maxCount: number;
  minCount: number;
}

// A claim draws a count between the least and the most, so a least above the most has no count to draw, and an average
// Outside them is no average the draw can reach
export const rewardItemSchema = z
  .object({
    averageCount: z.number().optional(),
    itemId: z.int().positive(),
    maxCount: z.int().positive(),
    minCount: z.int().nonnegative(),
  })
  .refine(({ maxCount, minCount }) => minCount <= maxCount, "Least count must not exceed most count")
  .refine(
    ({ averageCount, maxCount, minCount }) =>
      averageCount === undefined || (minCount <= averageCount && averageCount <= maxCount),
    "Average count must lie between the least and most count",
  ) satisfies z.ZodType<RewardItem>;
