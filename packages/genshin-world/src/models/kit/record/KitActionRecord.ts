import type { KitHitRecord } from "#src/models/kit/record/KitHitRecord";
import type { KitParameter } from "#src/models/kit/record/KitParameter";

import { kitHitRecordSchema } from "#src/models/kit/record/KitHitRecord";
import { kitParameterSchema } from "#src/models/kit/record/KitParameter";
import { KitTargeting } from "#src/models/kit/record/KitTargeting";
import { z } from "zod";

// One action of a kit's record: the frames it lasts at 60 a second, its hits in the order their hitmarks fall, whether
// It is an aimed shot, the stamina it drains each second it plays, and the zone it targets within
export interface KitActionRecord {
  cancelFrames: number;
  hits: KitHitRecord[];
  isAimed?: true;
  staminaPerSecond?: KitParameter;
  targeting: KitTargeting;
}

export const kitActionRecordSchema = z.strictObject({
  cancelFrames: z.number().nonnegative(),
  hits: z.array(kitHitRecordSchema),
  isAimed: z.literal(true).optional(),
  staminaPerSecond: kitParameterSchema.optional(),
  targeting: z.enum(KitTargeting),
}) satisfies z.ZodType<KitActionRecord>;
