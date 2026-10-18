import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// One ley line blossom of the official map placed in its region: the map point's id, which the outcrop standing at it
// Is known by, and the ground point it stands at, carried into the game's axes round the origin as the region's waypoints are
export interface OutcropPlacement {
  id: number;
  position: GroundPoint;
}

export const outcropPlacementSchema = z.object({
  id: z.int().min(1),
  position: groundPointSchema,
}) satisfies z.ZodType<OutcropPlacement>;
