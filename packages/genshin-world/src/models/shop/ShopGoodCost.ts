import { z } from "zod";

// One cost a good is bought with: an item and how many of it, as the game's shop goods list their costs. The item is a
// Currency the shop trades in, such as Mora or a Fate, or an item the bag holds, such as a fish
export interface ShopGoodCost {
  count: number;
  itemId: number;
}

export const shopGoodCostSchema = z.object({
  count: z.int().nonnegative(),
  itemId: z.int().positive(),
}) satisfies z.ZodType<ShopGoodCost>;
