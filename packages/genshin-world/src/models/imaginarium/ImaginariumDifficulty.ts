import { z } from "zod";

// One difficulty of the Imaginarium Theater: its id, its level from one to five, and the level floor a cast member must
// Reach to take part at it, the acts it runs, and the Alternate Cast it needs beyond its six opening characters: a
// Minimum and the extra it allows past that, absent where the game's table leaves it out
export interface ImaginariumDifficulty {
  actCount: number;
  alternateCastExtra?: number;
  alternateCastMinimum: number;
  id: number;
  level: number;
  levelFloor: number;
}

export const imaginariumDifficultySchema = z.object({
  actCount: z.int().positive(),
  alternateCastExtra: z.int().nonnegative().optional(),
  alternateCastMinimum: z.int().positive(),
  id: z.int().positive(),
  level: z.int().positive(),
  levelFloor: z.int().positive(),
}) satisfies z.ZodType<ImaginariumDifficulty>;
