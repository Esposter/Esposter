import type { RidgeFeature } from "genshin-engine";

import { TerrainFeatureKind } from "genshin-engine";
import { z } from "zod";

export const ridgeFeatureSchema = z.object({
  endX: z.number(),
  endZ: z.number(),
  height: z.number(),
  kind: z.literal(TerrainFeatureKind.Ridge),
  startX: z.number(),
  startZ: z.number(),
  width: z.number().positive(),
}) satisfies z.ZodType<RidgeFeature>;
