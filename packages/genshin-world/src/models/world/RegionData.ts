import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { Landmark } from "#src/models/world/Landmark";
import type { Resident } from "#src/models/world/Resident";
import type { WaterfallSheet } from "genshin-engine";

import { enemyCampSchema } from "#src/models/enemy/EnemyCamp";
import { landmarkSchema } from "#src/models/world/Landmark";
import { residentSchema } from "#src/models/world/Resident";
import { waterfallSheetSchema } from "#src/models/world/waterfallSheetSchema";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// One region's authored data, fetched when the camera nears it and dropped when it leaves: its enemies' camps, its
// Landmarks and the residents placed among them now, its waterfalls hung from their lips, and its terrain shapes and
// Paint as they are drawn
export interface RegionData {
  enemyCamps: EnemyCamp[];
  id: string;
  landmarks: Landmark[];
  residents: Resident[];
  waterfalls: WaterfallSheet[];
}

export const regionDataSchema = z.object({
  enemyCamps: createUniqueArraySchema(enemyCampSchema, "id"),
  id: z.string().min(1),
  landmarks: createUniqueArraySchema(landmarkSchema, "id"),
  residents: createUniqueArraySchema(residentSchema, "id"),
  // A region the falls are not fitted for yet has none
  waterfalls: z.array(waterfallSheetSchema).default([]),
}) satisfies z.ZodType<RegionData>;
