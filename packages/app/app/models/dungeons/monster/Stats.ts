import { z } from "zod";

export interface Stats {
  attack: number;
  // This is used to calculate the amount of exp you gain when defeating the monster
  baseExp: number;
  level: number;
  maxHp: number;
}

export const statsSchema = z.object({
  attack: z.number().int().positive(),
  baseExp: z.number().int().positive(),
  level: z.number().int().positive(),
  maxHp: z.number().int().positive(),
}) as const satisfies z.ZodType<Stats>;
