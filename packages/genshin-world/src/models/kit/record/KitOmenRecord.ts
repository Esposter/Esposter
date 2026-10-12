import type { KitParameter } from "#src/models/kit/record/KitParameter";

import { kitParameterSchema } from "#src/models/kit/record/KitParameter";
import { z } from "zod";

// The status a bubble's burst leaves on its enemy, in a kit's record: the share of damage the enemy takes more while it
// Lasts, and its seconds
export interface KitOmenRecord {
  damageTakenBonus: KitParameter;
  secondsRemaining: KitParameter;
}

export const kitOmenRecordSchema = z.strictObject({
  damageTakenBonus: kitParameterSchema,
  secondsRemaining: kitParameterSchema,
}) satisfies z.ZodType<KitOmenRecord>;
