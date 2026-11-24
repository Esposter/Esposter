import { z } from "zod";

// A passive a character holds, by its proud skill group's id and the text id of its name.
// It opens at an ascension phase.
// The utility passive opens at the first phase, the character's own.
// The two ascension passives open at the first and at the fourth.
export interface Passive {
  nameTextId: string;
  phase: number;
  proudSkillGroupId: number;
}

export const passiveSchema = z.object({
  nameTextId: z.string().min(1),
  phase: z.int().nonnegative(),
  proudSkillGroupId: z.int().positive(),
}) satisfies z.ZodType<Passive>;
