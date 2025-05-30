import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";

import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";
import { itemEffectTypeSchema } from "@/models/dungeons/item/ItemEffectType";
import { z } from "zod/v4";

export interface ItemEffect extends ItemEntityType<ItemEffectType> {
  value: number;
}

export const itemEffectSchema = z.object({
  ...createItemEntityTypeSchema(itemEffectTypeSchema).shape,
  value: z.number(),
}) satisfies z.ZodType<ItemEffect>;
