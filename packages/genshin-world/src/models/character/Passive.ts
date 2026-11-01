import { z } from "zod";

// A passive a character holds, by its proud skill group's id, the text id of its name, and the ascension phase it opens
// At. The utility passive opens at the first phase, the character's own, and the two ascension passives at the first and
// The fourth
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
