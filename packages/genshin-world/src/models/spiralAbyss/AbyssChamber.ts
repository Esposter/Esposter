import type { AbyssStarCondition } from "#src/models/spiralAbyss/AbyssStarCondition";

import { abyssStarConditionSchema } from "#src/models/spiralAbyss/AbyssStarCondition";
import { z } from "zod";

// One of a floor's three chambers, by its id in the game's tables and its place on the floor, with the star conditions
// Its clear is judged by. Its enemies and scene are not read yet
export interface AbyssChamber {
  conditions: AbyssStarCondition[];
  id: number;
  index: number;
}

export const abyssChamberSchema = z.object({
  conditions: z.array(abyssStarConditionSchema),
  id: z.int().positive(),
  index: z.int().positive(),
}) satisfies z.ZodType<AbyssChamber>;
