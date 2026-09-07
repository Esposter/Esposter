import type { NodeHandleBounds } from "@vue-flow/core";

import { handleElementSchema } from "#shared/models/flowchartEditor/data/HandleElement";
import { z } from "zod";

// `.nullable()` rather than `.optional()`, and `id: z.string().nullish()` on the element: these mirror
// @vue-flow/core's own types, which is the boundary the null is permitted at
export const handleBoundsSchema = z.object({
  source: handleElementSchema.array().nullable(),
  target: handleElementSchema.array().nullable(),
}) satisfies z.ZodType<NodeHandleBounds>;
