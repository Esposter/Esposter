import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";
import type { KitHitRecord } from "#src/models/kit/record/KitHitRecord";
import type { KitHoldRecord } from "#src/models/kit/record/KitHoldRecord";
import type { KitParameter } from "#src/models/kit/record/KitParameter";
import type { KitSkillChainRecord } from "#src/models/kit/record/KitSkillChainRecord";

import { kitActionRecordSchema } from "#src/models/kit/record/KitActionRecord";
import { kitHitRecordSchema } from "#src/models/kit/record/KitHitRecord";
import { kitHoldRecordSchema } from "#src/models/kit/record/KitHoldRecord";
import { kitParameterSchema } from "#src/models/kit/record/KitParameter";
import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { kitSkillChainRecordSchema } from "#src/models/kit/record/KitSkillChainRecord";
import { z } from "zod";

// A character's kit as values, published as the `kits` index by avatar id: each action's frames, targeting and hits,
// The skill's and burst's cooldowns, cost, charges and holds, and the charged attack's stamina. What the character does
// With them is its behaviour module's
export interface KitRecord {
  burst: KitActionRecord;
  burstCooldownSeconds: KitParameter;
  // Absent where the burst draws on no Energy, as Mavuika's, which her Fighting Spirit readies instead
  burstEnergyCost?: KitParameter;
  burstVariant?: KitActionRecord;
  chargedAttack: KitActionRecord;
  chargedAttackStamina: KitParameter;
  normalAttacks: KitActionRecord[];
  plungeCollision: KitHitRecord;
  plunges: Record<KitPlunge, KitActionRecord>;
  skill: KitActionRecord;
  skillChain?: KitSkillChainRecord;
  skillCharges?: KitParameter;
  skillCooldownSeconds: KitParameter;
  skillHolds: KitHoldRecord[];
  skillMaximumHeldSeconds?: KitParameter;
}

export const kitRecordSchema = z.strictObject({
  burst: kitActionRecordSchema,
  burstCooldownSeconds: kitParameterSchema,
  burstEnergyCost: kitParameterSchema.optional(),
  burstVariant: kitActionRecordSchema.optional(),
  chargedAttack: kitActionRecordSchema,
  chargedAttackStamina: kitParameterSchema,
  normalAttacks: z.array(kitActionRecordSchema),
  plungeCollision: kitHitRecordSchema,
  plunges: z.strictObject({ [KitPlunge.High]: kitActionRecordSchema, [KitPlunge.Low]: kitActionRecordSchema }),
  skill: kitActionRecordSchema,
  skillChain: kitSkillChainRecordSchema.optional(),
  skillCharges: kitParameterSchema.optional(),
  skillCooldownSeconds: kitParameterSchema,
  skillHolds: z.array(kitHoldRecordSchema),
  skillMaximumHeldSeconds: kitParameterSchema.optional(),
}) satisfies z.ZodType<KitRecord>;
