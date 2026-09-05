import { z } from "zod";

export interface Statistics {
  attack: number;
  // The experience a defeat of this monster awards is calculated from it
  baseExperience: number;
  defense: number;
  level: number;
  maxHealth: number;
}

export const statisticsSchema = z.object({
  attack: z.int().positive(),
  baseExperience: z.int().positive(),
  defense: z.int().positive(),
  level: z.int().positive(),
  maxHealth: z.int().positive(),
}) satisfies z.ZodType<Statistics>;
