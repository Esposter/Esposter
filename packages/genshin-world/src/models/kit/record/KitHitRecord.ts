import type { AttackArea } from "#src/models/kit/AttackArea";
import type { KitParameter } from "#src/models/kit/record/KitParameter";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { attackAreaSchema } from "#src/models/kit/AttackArea";
import { kitParameterSchema } from "#src/models/kit/record/KitParameter";
import { z } from "zod";

// One hit of a kit's record: the cylinder it reaches, and while an infusion converts its attacks the cylinder and poise
// It takes instead, the element it deals, none for a physical hit, its gauge, its hitmark in frames at 60 a second from
// The action's start, its internal cooldown tag, whether it is blunt, its talent multiplier and its poise damage
export interface KitHitRecord {
  area: AttackArea;
  convertedArea?: AttackArea;
  convertedPoiseDamage?: number;
  element?: Element;
  gauge?: number;
  hitmarkFrames: number;
  internalCooldownTag?: InternalCooldownTag;
  isBlunt?: true;
  multiplier: KitParameter;
  poiseDamage: number;
}

export const kitHitRecordSchema = z.strictObject({
  area: attackAreaSchema,
  convertedArea: attackAreaSchema.optional(),
  convertedPoiseDamage: z.number().nonnegative().optional(),
  element: z.enum(Element).optional(),
  gauge: z.number().nonnegative().optional(),
  hitmarkFrames: z.number().nonnegative(),
  internalCooldownTag: z.enum(InternalCooldownTag).optional(),
  isBlunt: z.literal(true).optional(),
  multiplier: kitParameterSchema,
  poiseDamage: z.number().nonnegative(),
}) satisfies z.ZodType<KitHitRecord>;
