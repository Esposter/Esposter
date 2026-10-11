import type { TerrainResidual, TerrainResidualClearing, TerrainResidualFade } from "genshin-engine";

import { z } from "zod";

// A disc its residual is kept out of: its centre, its radius, and the falloff the residual fades in across past it
const terrainResidualClearingSchema = z.object({
  falloff: z.number().nonnegative(),
  radius: z.number().nonnegative(),
  x: z.number(),
  z: z.number(),
}) satisfies z.ZodType<TerrainResidualClearing>;
// The grid a residual is drawn over, read bilinearly: its corner, the distance between its nodes in metres, its node
// Counts along x and z, the weights at its nodes from none to one, and the clearings it is kept out of
const terrainResidualFadeSchema = z.object({
  cellSize: z.number().positive(),
  clearings: z.array(terrainResidualClearingSchema),
  origin: z.array(z.number()).length(2),
  size: z.array(z.int().positive()).length(2),
  weights: z.array(z.number().min(0).max(1)),
}) satisfies z.ZodType<TerrainResidualFade>;

// The fine ground the features leave: the first octave's amplitude and scale in metres, the octave count and seed, and
// The fade that draws it, which is absent where the residual is drawn whole
export const terrainResidualSchema = z.object({
  amplitude: z.number().nonnegative(),
  fade: terrainResidualFadeSchema.optional(),
  octaves: z.int().positive(),
  scale: z.number().positive(),
  seed: z.int(),
}) satisfies z.ZodType<TerrainResidual>;
