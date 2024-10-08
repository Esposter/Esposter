import type { Edge } from "@vue-flow/core";

import { z } from "zod";

export const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
}) satisfies z.ZodType<Edge>;
