import type { NodeHandleBounds } from "@vue-flow/core";

import { handleElementSchema } from "#shared/models/flowchartEditor/data/HandleElement";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export const handleBoundsSchema = z.object({
  source: createUniqueArraySchema(handleElementSchema).nullable(),
  target: createUniqueArraySchema(handleElementSchema).nullable(),
}) satisfies z.ZodType<NodeHandleBounds>;
