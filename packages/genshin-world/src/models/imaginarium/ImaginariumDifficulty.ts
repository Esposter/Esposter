import { z } from "zod";

// One difficulty of the Imaginarium Theater: its id, its level from one to five, and the level floor a cast member must
// Reach to take part at it
export interface ImaginariumDifficulty {
  id: number;
  level: number;
  levelFloor: number;
}

export const imaginariumDifficultySchema = z.object({
  id: z.int().positive(),
  level: z.int().positive(),
  levelFloor: z.int().positive(),
}) satisfies z.ZodType<ImaginariumDifficulty>;
