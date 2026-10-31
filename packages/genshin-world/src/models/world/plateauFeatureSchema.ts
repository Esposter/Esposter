import type { PlateauFeature } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { TerrainFeatureKind } from "genshin-engine";
import { z } from "zod";

export const plateauFeatureSchema = z.object({
  ...groundPointSchema.shape,
  falloff: z.number().positive(),
  height: z.number(),
  kind: z.literal(TerrainFeatureKind.Plateau),
  radius: z.number().nonnegative(),
}) satisfies z.ZodType<PlateauFeature>;
