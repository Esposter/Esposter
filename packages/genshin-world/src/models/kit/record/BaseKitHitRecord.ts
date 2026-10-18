import type { AttackArea } from "#src/models/kit/AttackArea";
import type { KitParameter } from "#src/models/kit/record/KitParameter";
import type { KitPartyHealRecord } from "#src/models/kit/record/KitPartyHealRecord";
import type { KitStackedHitRecord } from "#src/models/kit/record/KitStackedHitRecord";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";
import { attackAreaSchema } from "#src/models/kit/AttackArea";
import { kitParameterSchema } from "#src/models/kit/record/KitParameter";
import { kitPartyHealRecordSchema } from "#src/models/kit/record/KitPartyHealRecord";
import { kitStackedHitRecordSchema } from "#src/models/kit/record/KitStackedHitRecord";
import { z } from "zod";

// One hit of a kit's record short of a bubble, which a bubble's explosion is: the cylinder it reaches, and while an
// Infusion converts its attacks the cylinder and poise it takes instead, the element it deals, none for a physical hit,
// Its gauge, its hitmark in frames at 60 a second from the action's start, its internal cooldown tag, its talent
// Multiplier and its poise damage
export interface BaseKitHitRecord {
  area: AttackArea;
  // The kind of attack the hit is dealt as where it names its own, rather than its action's
  attackTag?: AttackTag;
  convertedArea?: AttackArea;
  convertedPoiseDamage?: number;
  // The DMG Bonus the hit carries of its own
  damageBonus?: KitParameter;
  element?: Element;
  gauge?: number;
  healParty?: KitPartyHealRecord;
  hitmarkFrames: number;
  internalCooldownTag?: InternalCooldownTag;
  // The Lunar reaction a direct Lunar hit deals its damage as
  lunarReactionType?: LunarReactionType;
  multiplier: KitParameter;
  // A second table the multiplier is multiplied by, read at the level of the talent its proud skill group belongs to, as an
  // Enhanced normal attack is its normal attack's multiplier times its skill's
  multiplierFactor?: KitParameter;
  poiseDamage: number;
  // The stat the multiplier is a share of, where it is not ATK
  scalingAttribute?: Attribute;
  stackedHit?: KitStackedHitRecord;
}

export const baseKitHitRecordSchema = z.strictObject({
  area: attackAreaSchema,
  attackTag: z.enum(AttackTag).optional(),
  convertedArea: attackAreaSchema.optional(),
  convertedPoiseDamage: z.number().nonnegative().optional(),
  damageBonus: kitParameterSchema.optional(),
  element: z.enum(Element).optional(),
  gauge: z.number().nonnegative().optional(),
  healParty: kitPartyHealRecordSchema.optional(),
  hitmarkFrames: z.number().nonnegative(),
  internalCooldownTag: z.enum(InternalCooldownTag).optional(),
  lunarReactionType: z.enum(LunarReactionType).optional(),
  multiplier: kitParameterSchema,
  multiplierFactor: kitParameterSchema.optional(),
  poiseDamage: z.number().nonnegative(),
  scalingAttribute: z.enum(Attribute).optional(),
  stackedHit: kitStackedHitRecordSchema.optional(),
}) satisfies z.ZodType<BaseKitHitRecord>;
