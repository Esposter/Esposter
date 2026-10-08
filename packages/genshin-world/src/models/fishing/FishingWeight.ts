import { z } from "zod";

// One fish's weight in a stock: the chance it is drawn is its weight over the stock's total
export interface FishingWeight {
  fishId: number;
  weight: number;
}

export const fishingWeightSchema = z.object({
  fishId: z.int().positive(),
  weight: z.int().nonnegative(),
}) satisfies z.ZodType<FishingWeight>;
