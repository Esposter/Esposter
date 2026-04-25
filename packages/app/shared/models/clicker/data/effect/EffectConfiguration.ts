import type { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import type { ItemType } from "#shared/models/clicker/data/ItemType";
import type { Target } from "#shared/models/clicker/data/Target";
import type { ItemEntityType } from "@esposter/shared";

import { effectTypeSchema } from "#shared/models/clicker/data/effect/EffectType";
import { itemTypeSchema } from "#shared/models/clicker/data/ItemType";
import { targetSchema } from "#shared/models/clicker/data/Target";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";
// Only used for effect types that are based off other specific targets
export interface EffectConfiguration extends ItemEntityType<EffectType> {
  // E.g. "Upgrade" item type would apply the effect to enhance the upgrade effects themselves
  itemType?: ItemType;
  // Only used if the effect type affects special item types
  // E.g. BuildingAdditive requires number of buildings (targets)
  targets?: Target[];
}

export const effectConfigurationSchema = z.object({
  ...createItemEntityTypeSchema(effectTypeSchema).shape,
  itemType: itemTypeSchema.optional(),
  targets: targetSchema.array().optional(),
}) satisfies z.ZodType<EffectConfiguration>;
