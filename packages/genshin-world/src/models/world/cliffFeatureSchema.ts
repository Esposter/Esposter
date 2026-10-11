import type { CliffFeature } from "genshin-engine";

import { TerrainFeatureKind } from "genshin-engine";
import { z } from "zod";

export const cliffFeatureSchema = z.object({
  endX: z.number(),
  endZ: z.number(),
  falloff: z.number().positive(),
  height: z.number(),
  kind: z.literal(TerrainFeatureKind.Cliff),
  startX: z.number(),
  startZ: z.number(),
  width: z.number().positive(),
}) satisfies z.ZodType<CliffFeature>;
