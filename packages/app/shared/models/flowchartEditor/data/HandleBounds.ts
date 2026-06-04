import type { NodeHandleBounds } from "@vue-flow/core";

import { handleElementSchema } from "#shared/models/flowchartEditor/data/HandleElement";
import { z } from "zod";

export const handleBoundsSchema = z.object({
  source: handleElementSchema.array().nullable(),
  target: handleElementSchema.array().nullable(),
}) satisfies z.ZodType<NodeHandleBounds>;
