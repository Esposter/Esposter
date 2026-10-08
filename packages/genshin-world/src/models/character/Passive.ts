import { z } from "zod";

// A passive a character holds, by its proud skill group's id, and the ascension phase it opens at. The utility passive
// Opens at the first phase, the character's own, and the two ascension passives at the first and the fourth
export interface Passive {
  phase: number;
  proudSkillGroupId: number;
}

export const passiveSchema = z.object({
  phase: z.int().nonnegative(),
  proudSkillGroupId: z.int().positive(),
}) satisfies z.ZodType<Passive>;
