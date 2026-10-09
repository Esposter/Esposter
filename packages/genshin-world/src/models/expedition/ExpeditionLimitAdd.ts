import { z } from "zod";

// The expeditions an Adventure Rank adds to the most that may be out at once, from the game's player level table
export interface ExpeditionLimitAdd {
  expeditionLimitAdd: number;
  level: number;
}

export const expeditionLimitAddSchema = z.object({
  expeditionLimitAdd: z.int().positive(),
  level: z.int().positive(),
}) satisfies z.ZodType<ExpeditionLimitAdd>;
