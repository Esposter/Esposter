import type { EffectType } from "@/models/clicker/data/effect/EffectType";
import type { ItemType } from "@/models/clicker/data/ItemType";
import type { Target } from "@/models/clicker/data/Target";

import { effectTypeSchema } from "@/models/clicker/data/effect/EffectType";
import { itemTypeSchema } from "@/models/clicker/data/ItemType";
import { targetSchema } from "@/models/clicker/data/Target";
import { z } from "zod";

export interface EffectConfiguration {
  // e.g. "Upgrade" item type would apply the effect to enhance the upgrade effects themselves
  itemType?: ItemType;
  // Only used if the effect type affects special item types
  // e.g. BuildingAdditive requires number of buildings (targets)
  targets?: Target[];
  // Only used for effect types that are based off other specific targets
  type: EffectType;
}

export const effectConfigurationSchema = z.object({
  itemType: itemTypeSchema.optional(),
  targets: z.array(targetSchema).optional(),
  type: effectTypeSchema,
}) satisfies z.ZodType<EffectConfiguration>;
