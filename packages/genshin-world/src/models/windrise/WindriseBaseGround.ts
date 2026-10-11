import type { GaussianHill, TerrainShape } from "genshin-engine";

import { plateauFeatureSchema } from "#src/models/world/plateauFeatureSchema";
import { terrainResidualSchema } from "#src/models/world/terrainResidualSchema";
import { z } from "zod";

// Windrise's base ground: the Gaussian hills, the plateaus the fit draws over them and the residual noise below both,
// And the height range every tile of the ground is bounded by
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

// The ground fits draw plateau features only, so the base's features take the plateau schema
export const windriseBaseGroundSchema = z.object({
  base: z.number(),
  features: z.array(plateauFeatureSchema),
  hills: z.array(gaussianHillSchema),
  maxHeight: z.number(),
  minHeight: z.number(),
  residual: terrainResidualSchema,
}) satisfies z.ZodType<WindriseBaseGround>;
