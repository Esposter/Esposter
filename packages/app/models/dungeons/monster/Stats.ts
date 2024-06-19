import { z } from "zod";

export interface Stats {
  maxHp: number;
  attack: number;
  // This is the amount of exp you gain when defeating the monster
  exp: number;
}

export const statsSchema = z.object({
  maxHp: z.number().int().positive(),
  attack: z.number().int().positive(),
  exp: z.number().int().positive(),
}) satisfies z.ZodType<Stats>;
