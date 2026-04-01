import type { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import type { ItemEffect } from "#shared/models/dungeons/item/ItemEffect";
import type { Description } from "#shared/models/entity/Description";

import { itemEffectSchema } from "#shared/models/dungeons/item/ItemEffect";
import { itemIdSchema } from "#shared/models/dungeons/item/ItemId";
import { descriptionSchema } from "#shared/models/entity/Description";
import { z } from "zod";

export interface Item extends Description {
  effect: ItemEffect;
  id: ItemId;
  quantity: number;
}

export const itemSchema = z.object({
  ...descriptionSchema.extend({ description: z.string().min(1) }).shape,
  effect: itemEffectSchema,
  id: itemIdSchema,
  quantity: z.int().positive(),
}) satisfies z.ZodType<Item>;
