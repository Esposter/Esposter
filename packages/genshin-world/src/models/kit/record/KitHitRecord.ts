import type { BaseKitHitRecord } from "#src/models/kit/record/BaseKitHitRecord";
import type { KitBubbleRecord } from "#src/models/kit/record/KitBubbleRecord";
import type { z } from "zod";

import { baseKitHitRecordSchema } from "#src/models/kit/record/BaseKitHitRecord";
import { kitBubbleRecordSchema } from "#src/models/kit/record/KitBubbleRecord";

// One hit of a kit's record, with the bubble it holds the enemy it strikes in, if it holds one
export interface KitHitRecord extends BaseKitHitRecord {
  bubble?: KitBubbleRecord;
}

export const kitHitRecordSchema = baseKitHitRecordSchema.extend({
  bubble: kitBubbleRecordSchema.optional(),
}) satisfies z.ZodType<KitHitRecord>;
