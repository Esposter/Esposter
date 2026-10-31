import type { RiverCoursePoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

export const riverCoursePointSchema = z.object({
  ...groundPointSchema.shape,
  level: z.number(),
  width: z.number().nonnegative(),
}) satisfies z.ZodType<RiverCoursePoint>;
