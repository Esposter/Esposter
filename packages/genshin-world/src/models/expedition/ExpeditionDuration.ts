import type { ExpeditionRewardItem } from "#src/models/expedition/ExpeditionRewardItem";

import { expeditionRewardItemSchema } from "#src/models/expedition/ExpeditionRewardItem";
import { z } from "zod";

// One length of time a place offers an expedition for, the hours a character is away, and the items a claim of it gives
export interface ExpeditionDuration {
  hours: number;
  items: ExpeditionRewardItem[];
}

export const expeditionDurationSchema = z.object({
  hours: z.int().positive(),
  items: z.array(expeditionRewardItemSchema),
}) satisfies z.ZodType<ExpeditionDuration>;
