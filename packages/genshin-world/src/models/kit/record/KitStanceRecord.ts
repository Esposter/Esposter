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
  // The count the stance holds as it begins, which its dash and jump each drain by `drainPerAction`, and whose spending
  // To none ends the stance, if it holds one
  resource?: { drainPerAction: KitParameter; startingCount: KitParameter };
  skill?: KitActionRecord;
}

export const kitStanceRecordSchema = z.strictObject({
  burst: kitActionRecordSchema.optional(),
  chargedAttack: kitActionRecordSchema.optional(),
  chargedAttackStamina: kitParameterSchema.optional(),
  dash: kitActionRecordSchema.optional(),
  jump: kitActionRecordSchema.optional(),
  normalAttacks: z.array(kitActionRecordSchema).optional(),
  resource: z.strictObject({ drainPerAction: kitParameterSchema, startingCount: kitParameterSchema }).optional(),
  skill: kitActionRecordSchema.optional(),
}) satisfies z.ZodType<KitStanceRecord>;
