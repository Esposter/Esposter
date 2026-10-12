import type { KitParameter } from "#src/models/kit/record/KitParameter";

import { kitParameterSchema } from "#src/models/kit/record/KitParameter";
import { z } from "zod";

// The heal a hit may give the whole party, in a kit's record: the shares of its striker's ATK, DEF and Max HP it adds
// To its flat HP, and whether it rolls without a shield. The chance it rolls at is its module's
export interface KitPartyHealRecord {
  attackShare?: KitParameter;
  defenseShare: KitParameter;
  flatHealth: KitParameter;
  isUnshielded?: true;
  maxHealthShare?: KitParameter;
}

export const kitPartyHealRecordSchema = z.strictObject({
  attackShare: kitParameterSchema.optional(),
  defenseShare: kitParameterSchema,
  flatHealth: kitParameterSchema,
  isUnshielded: z.literal(true).optional(),
  maxHealthShare: kitParameterSchema.optional(),
}) satisfies z.ZodType<KitPartyHealRecord>;
