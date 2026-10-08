import type { BuildingOptions } from "genshin-engine";

import { RoofKind } from "genshin-engine";
import { z } from "zod";

export const buildingOptionsSchema = z.object({
  depth: z.number().positive(),
  platformHeight: z.number().nonnegative(),
  roofHeight: z.number().positive(),
  roofKind: z.enum(RoofKind),
  wallHeight: z.number().positive(),
  wallThickness: z.number().positive(),
  width: z.number().positive(),
}) satisfies z.ZodType<BuildingOptions>;
