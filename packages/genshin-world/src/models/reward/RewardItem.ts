import { z } from "zod";

// One item a reward gives: its id in the game's tables, and the least and most of it a claim may draw. A least of zero is
// A roll that may give nothing, as a reward preview's range spells it
export interface RewardItem {
  itemId: number;
  maxCount: number;
  minCount: number;
}

// A claim draws a count between the least and the most, so a least above the most has no count to draw
export const rewardItemSchema = z
  .object({ itemId: z.int().positive(), maxCount: z.int().positive(), minCount: z.int().nonnegative() })
  .refine(
    ({ maxCount, minCount }) => minCount <= maxCount,
    "Least count must not exceed most count",
  ) satisfies z.ZodType<RewardItem>;
