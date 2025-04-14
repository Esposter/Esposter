import type { Node } from "@vue-flow/core";

import { xyPositionSchema } from "#shared/models/flowchartEditor/data/XYPosition";
import { z } from "zod";

export const nodeSchema = z.interface({
  id: z.string(),
  position: xyPositionSchema,
}) satisfies z.ZodType<Node>;
