import type { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import type { ItemType } from "#shared/models/clicker/data/ItemType";
import type { Target } from "#shared/models/clicker/data/Target";
import type { ItemEntityType } from "@esposter/shared";

import { effectTypeSchema } from "#shared/models/clicker/data/effect/EffectType";
import { itemTypeSchema } from "#shared/models/clicker/data/ItemType";
import { targetSchema } from "#shared/models/clicker/data/Target";
import { createItemEntityTypeSchema, createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";
// Only used for effect types based off other specific targets.
export interface EffectConfiguration extends ItemEntityType<EffectType> {
  // E.g. the "Upgrade" item type enhances the upgrade effects themselves.
  itemType?: ItemType;
  // Only used when the effect type affects special item types (e.g. BuildingAdditive needs target buildings).
  targets?: Target[];
}

export const effectConfigurationSchema = z.object({
  ...createItemEntityTypeSchema(effectTypeSchema).shape,
  itemType: itemTypeSchema.optional(),
  targets: createUniqueArraySchema(targetSchema).optional(),
}) satisfies z.ZodType<EffectConfiguration>;
