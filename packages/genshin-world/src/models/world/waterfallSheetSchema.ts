import type { WaterfallSheet } from "genshin-engine";

import { vector3Schema } from "#src/models/world/vector3Schema";
import { z } from "zod";

export const waterfallSheetSchema = z.object({
  across: vector3Schema,
  drop: z.number().nonnegative(),
  lip: vector3Schema,
  width: z.number().nonnegative(),
}) satisfies z.ZodType<WaterfallSheet>;
