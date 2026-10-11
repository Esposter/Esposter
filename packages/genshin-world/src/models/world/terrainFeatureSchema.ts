import type { TerrainFeature } from "genshin-engine";

import { cliffFeatureSchema } from "#src/models/world/cliffFeatureSchema";
import { plateauFeatureSchema } from "#src/models/world/plateauFeatureSchema";
import { ridgeFeatureSchema } from "#src/models/world/ridgeFeatureSchema";
import { z } from "zod";

export const terrainFeatureSchema = z.discriminatedUnion("kind", [
  cliffFeatureSchema,
  plateauFeatureSchema,
  ridgeFeatureSchema,
]) satisfies z.ZodType<TerrainFeature>;
