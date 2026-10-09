import type { WishPity } from "#src/models/wish/WishPity";

import { z } from "zod";

// One kind of wish's counters as the save holds them, the same shape WishPity has
export const wishPitySaveSchema = z.object({
  chartedWeaponId: z.int().positive().optional(),
  fatePoints: z.int().nonnegative(),
  fiveStarCount: z.int().nonnegative(),
  fourStarCount: z.int().nonnegative(),
  isFiveStarGuaranteed: z.boolean(),
  isFourStarGuaranteed: z.boolean(),
  lossCount: z.int().nonnegative(),
  wishCount: z.int().nonnegative(),
}) satisfies z.ZodType<WishPity>;

export type WishPitySave = z.infer<typeof wishPitySaveSchema>;
