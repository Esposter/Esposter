import { z } from "zod";

export interface Stats {
  level: number;
  maxHp: number;
  attack: number;
  // This is used to calculate the amount of exp you gain when defeating the monster
  baseExp: number;
}

export const statsSchema = z.object({
  level: z.number().int().positive(),
  maxHp: z.number().int().positive(),
  attack: z.number().int().positive(),
  baseExp: z.number().int().positive(),
}) satisfies z.ZodType<Stats>;
