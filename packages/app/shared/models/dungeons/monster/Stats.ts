import { z } from "zod";

export interface Stats {
  attack: number;
  // This is used to calculate the amount of exp you gain when defeating the monster
  baseExp: number;
  defense: number;
  level: number;
  maxHp: number;
}

export const statsSchema = z.object({
  attack: z.int().positive(),
  baseExp: z.int().positive(),
  defense: z.int().positive(),
  level: z.int().positive(),
  maxHp: z.int().positive(),
}) satisfies z.ZodType<Stats>;
