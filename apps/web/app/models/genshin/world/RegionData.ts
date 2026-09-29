import type { Landmark } from "@/models/genshin/world/Landmark";

import { landmarkSchema } from "@/models/genshin/world/Landmark";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// One region's authored data, fetched when the camera nears it and dropped when it leaves: its landmarks now, and its
// Terrain shapes and paint as they are drawn
export interface RegionData {
  id: string;
  landmarks: Landmark[];
}

export const regionDataSchema = z.object({
  id: z.string().min(1),
  landmarks: createUniqueArraySchema(landmarkSchema, "id"),
}) satisfies z.ZodType<RegionData>;
