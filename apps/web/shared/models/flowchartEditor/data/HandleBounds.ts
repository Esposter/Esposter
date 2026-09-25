import type { NodeHandleBounds } from "@vue-flow/core";

import { handleElementSchema } from "#shared/models/flowchartEditor/data/HandleElement";
import { MAX_RESOURCE_CONTENT_LENGTH } from "#shared/services/resource/constants";
import { z } from "zod";

// `.nullable()` rather than `.optional()`, and `id: z.string().nullish()` on the element: these mirror
// @vue-flow/core's own types, which is the boundary the null is permitted at
export const handleBoundsSchema = z.object({
  source: handleElementSchema.array().max(MAX_RESOURCE_CONTENT_LENGTH).nullable(),
  target: handleElementSchema.array().max(MAX_RESOURCE_CONTENT_LENGTH).nullable(),
}) satisfies z.ZodType<NodeHandleBounds>;
