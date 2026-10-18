import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";
import type { GoToPlace } from "#src/models/world/GoToPlace";
import type { Landmark } from "#src/models/world/Landmark";
import type { Resident } from "#src/models/world/Resident";
import type { RiverCoursePoint, WaterfallSheet } from "genshin-engine";

import { enemyCampSchema } from "#src/models/enemy/EnemyCamp";
import { outcropPlacementSchema } from "#src/models/leyLine/OutcropPlacement";
import { goToPlaceSchema } from "#src/models/world/GoToPlace";
import { landmarkSchema } from "#src/models/world/Landmark";
import { residentSchema } from "#src/models/world/Resident";
import { riverCoursePointSchema } from "#src/models/world/riverCoursePointSchema";
import { waterfallSheetSchema } from "#src/models/world/waterfallSheetSchema";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// One region's authored data, fetched when the camera nears it and dropped when it leaves: its enemies' camps, its
// Landmarks and the residents placed among them now, the go-to places its quests reach, the ley line blossoms the
// Official map places in it, its rivers' courses and its waterfalls hung from their lips, and its terrain shapes and
// Paint as they are drawn
export interface RegionData {
  enemyCamps: EnemyCamp[];
  goToPlaces: GoToPlace[];
  id: string;
  landmarks: Landmark[];
  outcropPlaces: OutcropPlacement[];
  residents: Resident[];
  rivers: RiverCoursePoint[][];
  waterfalls: WaterfallSheet[];
}

export const regionDataSchema = z.object({
  enemyCamps: createUniqueArraySchema(enemyCampSchema, "id"),
  // A region no quest reaches a place in has none
  goToPlaces: z.array(goToPlaceSchema).default([]),
  id: z.string().min(1),
  landmarks: createUniqueArraySchema(landmarkSchema, "id"),
  // A region no ley line blossom is placed in has none
  outcropPlaces: z.array(outcropPlacementSchema).default([]),
  residents: createUniqueArraySchema(residentSchema, "id"),
  // A region with no river the game places has none, and a course is at least a segment long
  rivers: z.array(z.array(riverCoursePointSchema).min(2)).default([]),
  // A region the falls are not fitted for yet has none
  waterfalls: z.array(waterfallSheetSchema).default([]),
}) satisfies z.ZodType<RegionData>;
