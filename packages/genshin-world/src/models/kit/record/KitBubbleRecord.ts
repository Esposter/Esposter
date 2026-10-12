import type { BaseKitHitRecord } from "#src/models/kit/record/BaseKitHitRecord";
import type { KitOmenRecord } from "#src/models/kit/record/KitOmenRecord";
import type { KitParameter } from "#src/models/kit/record/KitParameter";

import { baseKitHitRecordSchema } from "#src/models/kit/record/BaseKitHitRecord";
import { kitOmenRecordSchema } from "#src/models/kit/record/KitOmenRecord";
import { kitParameterSchema } from "#src/models/kit/record/KitParameter";
import { z } from "zod";

// The bubble a hit holds the enemy it strikes in, in a kit's record: the explosion it bursts into, which holds no bubble
// Of its own, the status the burst leaves, and its seconds
export interface KitBubbleRecord {
  explosion: BaseKitHitRecord;
  omen: KitOmenRecord;
  secondsRemaining: KitParameter;
}

export const kitBubbleRecordSchema = z.strictObject({
  explosion: baseKitHitRecordSchema,
  omen: kitOmenRecordSchema,
  secondsRemaining: kitParameterSchema,
}) satisfies z.ZodType<KitBubbleRecord>;
