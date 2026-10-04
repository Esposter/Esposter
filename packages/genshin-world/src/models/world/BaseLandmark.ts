import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// What every landmark records: where it stands on the ground, how far above or into the ground its base sits, which
// Way it faces about the vertical in radians, and the catalogue area it belongs to
export interface BaseLandmark {
  areaId: string;
  heightOffset: number;
  id: string;
  position: GroundPoint;
  rotation: number;
}

export const baseLandmarkSchema = z.object({
  areaId: z.string().min(1),
  heightOffset: z.number(),
  id: z.string().min(1),
  position: groundPointSchema,
  rotation: z.number(),
}) satisfies z.ZodType<BaseLandmark>;
