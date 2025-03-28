import type { Node } from "@vue-flow/core";

import { xyPositionSchema } from "#shared/models/flowchartEditor/data/XYPosition";
import { z } from "zod";

export const nodeSchema = z.object({
  id: z.string(),
  position: xyPositionSchema,
}) as const satisfies z.ZodType<Node>;
