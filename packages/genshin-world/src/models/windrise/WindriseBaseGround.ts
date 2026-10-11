import type { GaussianHill, TerrainShape } from "genshin-engine";

import { terrainFeatureSchema } from "#src/models/world/terrainFeatureSchema";
import { terrainResidualSchema } from "#src/models/world/terrainResidualSchema";
import { z } from "zod";

// Windrise's base ground: the Gaussian hills, the plateaus, cliffs and ridges the fit draws over them and the residual
// Noise below both, and the height range every tile of the ground is bounded by
export interface WindriseBaseGround extends TerrainShape {
  maxHeight: number;
  minHeight: number;
}

const gaussianHillSchema = z.object({
  height: z.number(),
  width: z.number().positive(),
  x: z.number(),
  z: z.number(),
}) satisfies z.ZodType<GaussianHill>;

export const windriseBaseGroundSchema = z.object({
  base: z.number(),
  features: z.array(terrainFeatureSchema),
  hills: z.array(gaussianHillSchema),
  maxHeight: z.number(),
  minHeight: z.number(),
  residual: terrainResidualSchema,
}) satisfies z.ZodType<WindriseBaseGround>;
