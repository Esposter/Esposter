import type { TerrainFeature, TerrainShape } from "genshin-engine";

import { gaussianHillSchema } from "#src/models/world/gaussianHillSchema";
import { terrainFeatureSchema } from "#src/models/world/terrainFeatureSchema";
import { terrainResidualSchema } from "#src/models/world/terrainResidualSchema";
import { z } from "zod";

// A region's ground as its fit draws it: the Gaussian hills over its base, the plateaus, cliffs and ridges over them, the
// Residual's noise below both, and the heights it stands between, which bound every tile. A region no fit has drawn yet
// Holds no hills, so its base is never drawn, only the plateaus its places stand on over the world's base, and no
// Residual or bounds
export interface RegionGround extends TerrainShape {
  features: TerrainFeature[];
  maxHeight?: number;
  minHeight?: number;
}

export const regionGroundSchema = z.object({
  base: z.number(),
  features: z.array(terrainFeatureSchema),
  hills: z.array(gaussianHillSchema),
  maxHeight: z.number().optional(),
  minHeight: z.number().optional(),
  residual: terrainResidualSchema.optional(),
}) satisfies z.ZodType<RegionGround>;
