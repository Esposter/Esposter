import type { GaussianHill } from "genshin-engine";

import { z } from "zod";

export const gaussianHillSchema = z.object({
  height: z.number(),
  width: z.number().positive(),
  x: z.number(),
  z: z.number(),
}) satisfies z.ZodType<GaussianHill>;
