import type { WaterfallSheet } from "genshin-engine";

import { vector3Schema } from "#src/models/world/vector3Schema";
import { z } from "zod";

// A sheet's across is the unit direction of its lip, within a hundredth, the precision a fitted direction keeps
const UNIT_ACROSS_TOLERANCE = 0.01;

export const waterfallSheetSchema = z.object({
  across: vector3Schema.refine(
    (across) => Math.abs(across.length() - 1) <= UNIT_ACROSS_TOLERANCE,
    "a waterfall's across is a unit direction",
  ),
  drop: z.number().nonnegative(),
  lip: vector3Schema,
  width: z.number().nonnegative(),
}) satisfies z.ZodType<WaterfallSheet>;
