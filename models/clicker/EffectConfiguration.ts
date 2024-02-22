import type { EffectType } from "@/models/clicker/EffectType";
import { effectTypeSchema } from "@/models/clicker/EffectType";
import type { ItemType } from "@/models/clicker/ItemType";
import { itemTypeSchema } from "@/models/clicker/ItemType";
import type { Target } from "@/models/clicker/Target";
import { targetSchema } from "@/models/clicker/Target";
import { z } from "zod";

export interface EffectConfiguration {
  type: EffectType;
  // Only used if the effect type affects special item types
  // e.g. "Upgrade" item type would apply the effect to enhance the upgrade effects themselves
  itemType?: ItemType;
  // Only used for effect types that are based off other specific targets
  // e.g. BuildingAdditive requires number of buildings (targets)
  targets?: Target[];
}

export const effectConfigurationSchema = z.object({
  type: effectTypeSchema,
  itemType: itemTypeSchema.optional(),
  targets: z.array(targetSchema).optional(),
}) satisfies z.ZodType<EffectConfiguration>;
