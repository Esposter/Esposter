import { z } from "zod";

// Sumeru City's terraces grown round the colossal tree, in metres: tiers of a drum each a radiusStep narrower than the
// One below, a walkway ledge on each tier's top overhanging it, and a dome on the highest
export interface RainforestCityOptions {
  baseRadius: number;
  domeHeight: number;
  domeRadius: number;
  radialSegments: number;
  radiusStep: number;
  tierCount: number;
  tierHeight: number;
  walkwayHeight: number;
  walkwayOverhang: number;
}

export const rainforestCityOptionsSchema = z.object({
  baseRadius: z.number().positive(),
  domeHeight: z.number().positive(),
  domeRadius: z.number().positive(),
  radialSegments: z.int().min(3),
  radiusStep: z.number().nonnegative(),
  tierCount: z.int().positive(),
  tierHeight: z.number().positive(),
  walkwayHeight: z.number().positive(),
  walkwayOverhang: z.number().nonnegative(),
}) satisfies z.ZodType<RainforestCityOptions>;
