import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { Landmark } from "#src/models/world/Landmark";
import type { Resident } from "#src/models/world/Resident";

import { enemyCampSchema } from "#src/models/enemy/EnemyCamp";
import { landmarkSchema } from "#src/models/world/Landmark";
import { residentSchema } from "#src/models/world/Resident";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// One region's authored data, fetched when the camera nears it and dropped when it leaves: its enemies' camps, its
// Landmarks and the residents placed among them now, and its terrain shapes and paint as they are drawn
export interface RegionData {
  enemyCamps: EnemyCamp[];
  id: string;
  landmarks: Landmark[];
  residents: Resident[];
}

export const regionDataSchema = z.object({
  enemyCamps: createUniqueArraySchema(enemyCampSchema, "id"),
  id: z.string().min(1),
  landmarks: createUniqueArraySchema(landmarkSchema, "id"),
  residents: createUniqueArraySchema(residentSchema, "id"),
}) satisfies z.ZodType<RegionData>;
