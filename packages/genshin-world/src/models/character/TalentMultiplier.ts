import { z } from "zod";

// A combat talent's multipliers at one level: each parameter its description is written with, as the game's proud skill
// Row lists it. A parameter past the last one not zero is left out, so reads past it are zero
export interface TalentMultiplier {
  level: number;
  paramList: number[];
}

export const talentMultiplierSchema = z.object({
  level: z.int().positive(),
  paramList: z.array(z.number()),
}) satisfies z.ZodType<TalentMultiplier>;
