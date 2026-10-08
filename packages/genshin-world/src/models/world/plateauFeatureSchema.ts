import type { PlateauFeature } from "genshin-engine";

import { TerrainFeatureKind } from "genshin-engine";
import { z } from "zod";

export const plateauFeatureSchema = z.object({
  falloff: z.number().positive(),
  height: z.number(),
  kind: z.literal(TerrainFeatureKind.Plateau),
  radius: z.number().nonnegative(),
  x: z.number(),
  z: z.number(),
}) satisfies z.ZodType<PlateauFeature>;
