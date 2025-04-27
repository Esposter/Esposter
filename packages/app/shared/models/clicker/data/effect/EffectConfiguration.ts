import type { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import type { ItemType } from "#shared/models/clicker/data/ItemType";
import type { Target } from "#shared/models/clicker/data/Target";
import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";

import { effectTypeSchema } from "#shared/models/clicker/data/effect/EffectType";
import { itemTypeSchema } from "#shared/models/clicker/data/ItemType";
import { targetSchema } from "#shared/models/clicker/data/Target";
import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";
import { z } from "zod";
// Only used for effect types that are based off other specific targets
export interface EffectConfiguration extends ItemEntityType<EffectType> {
  // e.g. "Upgrade" item type would apply the effect to enhance the upgrade effects themselves
  itemType?: ItemType;
  // Only used if the effect type affects special item types
  // e.g. BuildingAdditive requires number of buildings (targets)
  targets?: Target[];
}

export const effectConfigurationSchema = createItemEntityTypeSchema(effectTypeSchema).merge(
  z.object({
    itemType: itemTypeSchema.optional(),
    targets: z.array(targetSchema).optional(),
  }),
) satisfies z.ZodType<EffectConfiguration>;
