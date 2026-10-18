import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// Where a jump lands at a landmark: the game's own transport place for it, the way the view faces there about the
// Vertical in radians, and how far above or into the ground that place stands, as a landmark's own base does
export interface LandmarkArrival {
  heightOffset: number;
  position: GroundPoint;
  rotation: number;
}

export const landmarkArrivalSchema = z.object({
  heightOffset: z.number(),
  position: groundPointSchema,
  rotation: z.number(),
}) satisfies z.ZodType<LandmarkArrival>;
