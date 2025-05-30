import type { Edge } from "@vue-flow/core";

import { z } from "zod/v4";

export const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
}) satisfies z.ZodType<Edge>;
