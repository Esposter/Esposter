import type { Edge } from "@vue-flow/core";

import { z } from "zod";

export const edgeSchema = z.interface({
  id: z.string(),
  source: z.string(),
  target: z.string(),
}) satisfies z.ZodType<Edge>;
