import type { OutcropKindRule } from "#src/models/leyLine/OutcropKindRule";
import type { OutcropPlace } from "#src/models/leyLine/OutcropPlace";

import { outcropKindRuleSchema } from "#src/models/leyLine/OutcropKindRule";
import { outcropPlaceSchema } from "#src/models/leyLine/OutcropPlace";
import { z } from "zod";

// A region's ley line outcrops as the game's tables give them: its two kinds' rules, the sections its outcrops are drawn
// From in the order the game lists them, and every place its groups name
export interface OutcropRegion {
  kinds: OutcropKindRule[];
  places: OutcropPlace[];
  sectionIds: number[];
}

export const outcropRegionSchema = z.object({
  kinds: z.array(outcropKindRuleSchema),
  places: z.array(outcropPlaceSchema),
  sectionIds: z.array(z.int().min(1)),
}) satisfies z.ZodType<OutcropRegion>;
