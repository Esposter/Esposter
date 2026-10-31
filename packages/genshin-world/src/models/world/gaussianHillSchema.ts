import type { GaussianHill } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

export const gaussianHillSchema = z.object({
  ...groundPointSchema.shape,
  height: z.number(),
  width: z.number().positive(),
}) satisfies z.ZodType<GaussianHill>;
