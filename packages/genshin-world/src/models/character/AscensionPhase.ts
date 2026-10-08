import type { AttributeLine } from "#src/models/character/AttributeLine";

import { attributeLineSchema } from "#src/models/character/AttributeLine";
import { z } from "zod";

// One ascension phase of a character or a weapon: the highest level it allows, and every attribute it adds over its
// Growth, the earlier phases' included
export interface AscensionPhase {
  attributeLines: AttributeLine[];
  maxLevel: number;
}

export const ascensionPhaseSchema = z.object({
  attributeLines: z.array(attributeLineSchema),
  maxLevel: z.int().positive(),
}) satisfies z.ZodType<AscensionPhase>;
