import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";
import type { KitParameter } from "#src/models/kit/record/KitParameter";

import { kitActionRecordSchema } from "#src/models/kit/record/KitActionRecord";
import { kitParameterSchema } from "#src/models/kit/record/KitParameter";
import { z } from "zod";

// The actions a stance plays in place of its kit's, in a kit's record, each absent where the stance plays the kit's own
export interface KitStanceRecord {
  burst?: KitActionRecord;
  chargedAttack?: KitActionRecord;
  chargedAttackStamina?: KitParameter;
  dash?: KitActionRecord;
  jump?: KitActionRecord;
  normalAttacks?: KitActionRecord[];
  skill?: KitActionRecord;
}

export const kitStanceRecordSchema = z.strictObject({
  burst: kitActionRecordSchema.optional(),
  chargedAttack: kitActionRecordSchema.optional(),
  chargedAttackStamina: kitParameterSchema.optional(),
  dash: kitActionRecordSchema.optional(),
  jump: kitActionRecordSchema.optional(),
  normalAttacks: z.array(kitActionRecordSchema).optional(),
  skill: kitActionRecordSchema.optional(),
}) satisfies z.ZodType<KitStanceRecord>;
