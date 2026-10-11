import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";

import { kitActionRecordSchema } from "#src/models/kit/record/KitActionRecord";
import { z } from "zod";

// A skill pressed again in a row, in a kit's record: each follow-up press's action, and the seconds after a press
// Within which the next may come
export interface KitSkillChainRecord {
  followUps: KitActionRecord[];
  windowSeconds: number;
}

export const kitSkillChainRecordSchema = z.strictObject({
  followUps: z.array(kitActionRecordSchema),
  windowSeconds: z.number().positive(),
}) satisfies z.ZodType<KitSkillChainRecord>;
