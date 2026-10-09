import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// Where a resident stands in one period of the day, the spot they idle at and the way they face there in radians
export interface ResidentSpot {
  position: GroundPoint;
  rotation: number;
}

export const residentSpotSchema = z.object({
  position: groundPointSchema,
  rotation: z.number(),
}) satisfies z.ZodType<ResidentSpot>;
