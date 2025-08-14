import type { HandleElement } from "@vue-flow/core";

import { dimensionsSchema } from "#shared/models/flowchartEditor/data/Dimensions";
import { graphNodeIdSchema } from "#shared/models/flowchartEditor/data/GraphNodeId";
import { handleTypeSchema } from "#shared/models/flowchartEditor/data/HandleType";
import { positionSchema } from "#shared/models/flowchartEditor/data/Position";
import { xyPositionSchema } from "#shared/models/flowchartEditor/data/XYPosition";
import { z } from "zod";

export const handleElementSchema = z.object({
  ...dimensionsSchema.shape,
  ...xyPositionSchema.shape,
  id: z.string().nullish(),
  nodeId: graphNodeIdSchema,
  position: positionSchema,
  type: handleTypeSchema,
}) satisfies z.ZodType<HandleElement>;
