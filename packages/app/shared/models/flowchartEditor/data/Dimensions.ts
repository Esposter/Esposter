import type { Dimensions } from "@vue-flow/core";

import { z } from "zod";

export const dimensionsSchema = z.object({
  height: z.int().positive(),
  width: z.int().positive(),
}) satisfies z.ZodType<Dimensions>;
