import type { LatheSection } from "genshin-engine";

import { z } from "zod";

export const latheSectionSchema = z.object({
  bottomRadius: z.number().nonnegative(),
  height: z.number().positive(),
  topRadius: z.number().nonnegative(),
}) satisfies z.ZodType<LatheSection>;
