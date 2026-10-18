import type { LandmarkArrival } from "#src/models/world/LandmarkArrival";
import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { landmarkArrivalSchema } from "#src/models/world/LandmarkArrival";
import { z } from "zod";

// What every landmark records: where it stands on the ground, how far above or into the ground its base sits, which
// Way it faces about the vertical in radians, the catalogue area it belongs to, and, for a landmark a jump may go to, the
// Place a jump lands at it. A landmark nothing jumps to has none
export interface BaseLandmark {
  areaId: string;
  arrival?: LandmarkArrival;
  heightOffset: number;
  id: string;
  position: GroundPoint;
  rotation: number;
}

export const baseLandmarkSchema = z.object({
  areaId: z.string().min(1),
  arrival: landmarkArrivalSchema.optional(),
  heightOffset: z.number(),
  id: z.string().min(1),
  position: groundPointSchema,
  rotation: z.number(),
}) satisfies z.ZodType<BaseLandmark>;
