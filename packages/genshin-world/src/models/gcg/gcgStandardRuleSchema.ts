import type { GcgRule } from "#src/models/gcg/GcgRule";

import { Element } from "#src/models/Element";
import { z } from "zod";

// The standard rule's slice as the dump's rule and reaction tables wrote it, each reaction's element pair checked to be
// Two of the world's elements
export const gcgStandardRuleSchema = z.object({
  drawCount: z.number().int().nonnegative(),
  handCardLimit: z.number().int().positive(),
  reactions: z.array(
    z.object({ elements: z.tuple([z.enum(Element), z.enum(Element)]), id: z.number().int().positive() }),
  ),
}) satisfies z.ZodType<GcgRule>;
