import { z } from "zod";

// One World Level's row of the game's world level table: the level the enemies it raises stand at, before each
// Spawn's own level is added
export interface WorldLevelRow {
  level: number;
  monsterLevel: number;
}

export const worldLevelRowSchema = z.object({
  level: z.int().min(1),
  monsterLevel: z.int().min(1),
}) satisfies z.ZodType<WorldLevelRow>;
