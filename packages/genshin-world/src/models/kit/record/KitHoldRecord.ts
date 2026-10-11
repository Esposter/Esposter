import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";
import type { KitParameter } from "#src/models/kit/record/KitParameter";

import { kitActionRecordSchema } from "#src/models/kit/record/KitActionRecord";
import { kitParameterSchema } from "#src/models/kit/record/KitParameter";
import { z } from "zod";

// A skill's hold level in a kit's record: the action its release plays, the cooldown it sets, the seconds it must be
// Held, and the action its variant plays instead, if it has one
export interface KitHoldRecord {
  action: KitActionRecord;
  cooldownSeconds: KitParameter;
  minimumHeldSeconds: number;
  variant?: KitActionRecord;
}

export const kitHoldRecordSchema = z.strictObject({
  action: kitActionRecordSchema,
  cooldownSeconds: kitParameterSchema,
  minimumHeldSeconds: z.number().nonnegative(),
  variant: kitActionRecordSchema.optional(),
}) satisfies z.ZodType<KitHoldRecord>;
