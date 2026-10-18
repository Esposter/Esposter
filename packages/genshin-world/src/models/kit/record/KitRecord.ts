import type { AttackArea } from "#src/models/kit/AttackArea";
import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";
import type { KitHitRecord } from "#src/models/kit/record/KitHitRecord";
import type { KitHoldRecord } from "#src/models/kit/record/KitHoldRecord";
import type { KitMoonsignBenedictionRecord } from "#src/models/kit/record/KitMoonsignBenedictionRecord";
import type { KitParameter } from "#src/models/kit/record/KitParameter";
import type { KitSkillChainRecord } from "#src/models/kit/record/KitSkillChainRecord";
import type { KitStanceRecord } from "#src/models/kit/record/KitStanceRecord";
import type { KitStellarJubileeRecord } from "#src/models/kit/record/KitStellarJubileeRecord";

import { attackAreaSchema } from "#src/models/kit/AttackArea";
import { kitActionRecordSchema } from "#src/models/kit/record/KitActionRecord";
import { kitHitRecordSchema } from "#src/models/kit/record/KitHitRecord";
import { kitHoldRecordSchema } from "#src/models/kit/record/KitHoldRecord";
import { kitMoonsignBenedictionRecordSchema } from "#src/models/kit/record/KitMoonsignBenedictionRecord";
import { kitParameterSchema } from "#src/models/kit/record/KitParameter";
import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { kitSkillChainRecordSchema } from "#src/models/kit/record/KitSkillChainRecord";
import { kitStanceRecordSchema } from "#src/models/kit/record/KitStanceRecord";
import { kitStellarJubileeRecordSchema } from "#src/models/kit/record/KitStellarJubileeRecord";
import { z } from "zod";

const createNamedSchema = <T extends z.ZodType>(schema: T) => z.record(z.string(), z.union([schema, z.array(schema)]));

// A character's kit as values, published as the `kits` index by avatar id: each action's frames, targeting and hits,
// The skill's and burst's cooldowns, cost, charges and holds, and the charged attack's stamina. Beside them, by the name
// Its behaviour module reads each by, the actions, areas, frames, hits, parameters and stances the module plays outside
// Those slots, a list where it reads one name at several places, and the fields of each hit it builds as it
// Plays. What the character does with them is its behaviour module's
export interface KitRecord {
  actions?: Record<string, KitActionRecord | KitActionRecord[]>;
  areas?: Record<string, AttackArea | AttackArea[]>;
  burst: KitActionRecord;
  burstCooldownSeconds: KitParameter;
  // Absent where the burst draws on no Energy, as Mavuika's, which her Fighting Spirit readies instead
  burstEnergyCost?: KitParameter;
  burstVariant?: KitActionRecord;
  chargedAttack: KitActionRecord;
  chargedAttackStamina: KitParameter;
  frames?: Record<string, number | number[]>;
  hitFields?: Record<string, Partial<KitHitRecord>>;
  hits?: Record<string, KitHitRecord | KitHitRecord[]>;
  moonsignBenediction?: KitMoonsignBenedictionRecord;
  normalAttacks: KitActionRecord[];
  parameters?: Record<string, KitParameter | KitParameter[]>;
  plungeCollision: KitHitRecord;
  plunges: Record<KitPlunge, KitActionRecord>;
  skill: KitActionRecord;
  skillChain?: KitSkillChainRecord;
  skillCharges?: KitParameter;
  skillCooldownSeconds: KitParameter;
  skillHolds: KitHoldRecord[];
  skillMaximumHeldSeconds?: KitParameter;
  stances?: Record<string, KitStanceRecord>;
  stellarJubilee?: KitStellarJubileeRecord;
}

export const kitRecordSchema = z.strictObject({
  actions: createNamedSchema(kitActionRecordSchema).optional(),
  areas: createNamedSchema(attackAreaSchema).optional(),
  burst: kitActionRecordSchema,
  burstCooldownSeconds: kitParameterSchema,
  burstEnergyCost: kitParameterSchema.optional(),
  burstVariant: kitActionRecordSchema.optional(),
  chargedAttack: kitActionRecordSchema,
  chargedAttackStamina: kitParameterSchema,
  frames: createNamedSchema(z.number().nonnegative()).optional(),
  hitFields: z.record(z.string(), kitHitRecordSchema.partial()).optional(),
  hits: createNamedSchema(kitHitRecordSchema).optional(),
  moonsignBenediction: kitMoonsignBenedictionRecordSchema.optional(),
  normalAttacks: z.array(kitActionRecordSchema),
  parameters: createNamedSchema(kitParameterSchema).optional(),
  plungeCollision: kitHitRecordSchema,
  plunges: z.strictObject({ [KitPlunge.High]: kitActionRecordSchema, [KitPlunge.Low]: kitActionRecordSchema }),
  skill: kitActionRecordSchema,
  skillChain: kitSkillChainRecordSchema.optional(),
  skillCharges: kitParameterSchema.optional(),
  skillCooldownSeconds: kitParameterSchema,
  skillHolds: z.array(kitHoldRecordSchema),
  skillMaximumHeldSeconds: kitParameterSchema.optional(),
  stances: z.record(z.string(), kitStanceRecordSchema).optional(),
  stellarJubilee: kitStellarJubileeRecordSchema.optional(),
}) satisfies z.ZodType<KitRecord>;
