import type { Node } from "@vue-flow/core";

import { xyPositionSchema } from "#shared/models/flowchartEditor/data/XYPosition";
import { z } from "zod/v4";

export const nodeSchema = z.object({
  id: z.string(),
  position: xyPositionSchema,
}) satisfies z.ZodType<Node>;
