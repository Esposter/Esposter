import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// The crafting bench's place in a region, in the region's own axes as the scripts publish it: the ground point it stands
// At and its turn in radians
export interface CraftingBenchPlace {
  position: GroundPoint;
  rotation: number;
}

export const craftingBenchPlaceSchema = z.object({
  position: groundPointSchema,
  rotation: z.number(),
}) satisfies z.ZodType<CraftingBenchPlace>;
