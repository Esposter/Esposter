import type { RiverCoursePoint } from "genshin-engine";

import { z } from "zod";

export const riverCoursePointSchema = z.object({
  level: z.number(),
  width: z.number().nonnegative(),
  x: z.number(),
  z: z.number(),
}) satisfies z.ZodType<RiverCoursePoint>;
