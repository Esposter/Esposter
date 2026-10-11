import type { KitParameter } from "#src/models/kit/record/KitParameter";

import { kitParameterSchema } from "#src/models/kit/record/KitParameter";
import { z } from "zod";

// A hit set by the stacks of a status on its enemy, in a kit's record: its multiplier and its poise at each count of
// Stacks, from none up. The status it reads is its module's
export interface KitStackedHitRecord {
  multipliers: KitParameter[];
  poiseDamages: number[];
}

export const kitStackedHitRecordSchema = z.strictObject({
  multipliers: z.array(kitParameterSchema),
  poiseDamages: z.array(z.number().nonnegative()),
}) satisfies z.ZodType<KitStackedHitRecord>;
