import type { AbyssStarCondition } from "#src/models/spiralAbyss/AbyssStarCondition";

import { abyssStarConditionSchema } from "#src/models/spiralAbyss/AbyssStarCondition";
import { z } from "zod";

// One of a floor's three chambers, by its id in the game's tables and its place on the floor, with the star conditions
// Its clear is judged by, and the monsters of each of its halves by their describe ids. A chamber the dump lists no monsters
// For has no halves, its enemies waiting on the game's scene export
export interface AbyssChamber {
  conditions: AbyssStarCondition[];
  halfMonsterDescribeIds: number[][];
  id: number;
  index: number;
  // The level the chamber's monsters are at, read off its level row
  monsterLevel: number;
}

export const abyssChamberSchema = z.object({
  conditions: z.array(abyssStarConditionSchema),
  halfMonsterDescribeIds: z.array(z.array(z.int().positive())),
  id: z.int().positive(),
  index: z.int().positive(),
  monsterLevel: z.int().positive(),
}) satisfies z.ZodType<AbyssChamber>;
