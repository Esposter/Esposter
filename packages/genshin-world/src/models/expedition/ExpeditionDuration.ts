import type { RewardItem } from "#src/models/reward/RewardItem";

import { rewardItemSchema } from "#src/models/reward/RewardItem";
import { z } from "zod";

// One length of time a place offers an expedition for, the hours a character is away, and the items a claim of it gives
export interface ExpeditionDuration {
  hours: number;
  items: RewardItem[];
}

export const expeditionDurationSchema = z.object({
  hours: z.int().positive(),
  items: z.array(rewardItemSchema),
}) satisfies z.ZodType<ExpeditionDuration>;
