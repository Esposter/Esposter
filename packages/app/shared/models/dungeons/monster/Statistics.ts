import { z } from "zod";

export interface Statistics {
  attack: number;
  // This is used to calculate the amount of experience you gain when defeating the monster
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
