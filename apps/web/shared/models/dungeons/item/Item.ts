import type { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import type { ItemEffect } from "#shared/models/dungeons/item/ItemEffect";
import type { Description } from "#shared/models/entity/Description";

import { itemEffectSchema } from "#shared/models/dungeons/item/ItemEffect";
import { itemIdSchema } from "#shared/models/dungeons/item/ItemId";
import { descriptionSchema } from "#shared/models/entity/Description";
import { DESCRIPTION_MAX_LENGTH } from "#shared/services/constants";
import { z } from "zod";

export interface Item extends Description {
  effect: ItemEffect;
  id: ItemId;
  quantity: number;
}

// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- ItemEffectType (ItemEffectType.ts:3) and ItemId (generated/tiled/propertyTypes/enum/ItemId.ts:1) are the same declarations on both sides (ItemEffect.ts:1); the rule flags a nested zod shape even on an exact enum match
export const itemSchema = z.object({
  ...descriptionSchema.shape,
  // An item without a description is a blank tooltip, so this one tightens the shared optional-text field
  description: z.string().min(1).max(DESCRIPTION_MAX_LENGTH),
  effect: itemEffectSchema,
  id: itemIdSchema,
  quantity: z.int().positive(),
}) satisfies z.ZodType<Item>;
