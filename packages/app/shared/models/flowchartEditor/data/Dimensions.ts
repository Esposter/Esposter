import type { Dimensions } from "@vue-flow/core";

import { z } from "zod";

export const dimensionsSchema = z.object({
  height: z.int().nonnegative(),
  width: z.int().nonnegative(),
}) satisfies z.ZodType<Dimensions>;
