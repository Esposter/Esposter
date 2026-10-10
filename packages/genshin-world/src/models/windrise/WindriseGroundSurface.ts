import type { WindriseSurface } from "#src/models/windrise/WindriseSurface";

import { windriseSurfaceSchema } from "#src/models/windrise/WindriseSurface";
import { GroundLayer } from "genshin-engine";
import { z } from "zod";

// The ground's surface, which also paints each layer its colour, where the base maps hold a texel of that layer
export interface WindriseGroundSurface extends WindriseSurface {
  layers: Partial<Record<GroundLayer, string>>;
}

export const windriseGroundSurfaceSchema = windriseSurfaceSchema.safeExtend({
  layers: z.partialRecord(z.enum(GroundLayer), z.string()),
}) satisfies z.ZodType<WindriseGroundSurface>;
