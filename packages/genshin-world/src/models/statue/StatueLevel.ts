import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

import { offeringLevelSchema } from "#src/models/offering/OfferingLevel";
import { z } from "zod";

// One level of a region's Statues of The Seven: an offering level whose items are Oculi, and the stamina it adds to the
// Maximum. Level 1 takes no Oculi and is paid when the region starts
export interface StatueLevel extends OfferingLevel {
  staminaShare: number;
}

export const statueLevelSchema = offeringLevelSchema.extend({
  staminaShare: z.int().nonnegative(),
}) satisfies z.ZodType<StatueLevel>;
