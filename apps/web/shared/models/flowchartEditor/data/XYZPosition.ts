import type { XYZPosition } from "@vue-flow/core";

import { xyPositionSchema } from "#shared/models/flowchartEditor/data/XYPosition";
import { z } from "zod";

export const xyzPositionSchema = z.object({
  ...xyPositionSchema.shape,
  z: z.int(),
}) satisfies z.ZodType<XYZPosition>;
