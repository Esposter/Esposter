import type { WindriseGroundSurface } from "#src/models/windrise/WindriseGroundSurface";
import type { WindriseSurface } from "#src/models/windrise/WindriseSurface";

import { windriseGroundSurfaceSchema } from "#src/models/windrise/WindriseGroundSurface";
import { WindrisePartFamily } from "#src/models/windrise/WindrisePartFamily";
import { windriseSurfaceSchema } from "#src/models/windrise/WindriseSurface";
import { z } from "zod";

// Each part family's surface, keyed by the family: the ground's also paints its layers, and the families the export
// Gives no surface of stay out
export interface WindriseSurfaces {
  [WindrisePartFamily.Ground]: WindriseGroundSurface;
  [WindrisePartFamily.Oak]: WindriseSurface;
  [WindrisePartFamily.Paving]: WindriseSurface;
  [WindrisePartFamily.Statue]: WindriseSurface;
}

export const windriseSurfacesSchema = z.object({
  [WindrisePartFamily.Ground]: windriseGroundSurfaceSchema,
  [WindrisePartFamily.Oak]: windriseSurfaceSchema,
  [WindrisePartFamily.Paving]: windriseSurfaceSchema,
  [WindrisePartFamily.Statue]: windriseSurfaceSchema,
}) satisfies z.ZodType<WindriseSurfaces>;
