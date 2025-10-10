import type { ItemEffectType } from "#shared/models/dungeons/item/ItemEffectType";
import type { ItemEntityType } from "@esposter/shared";

import { itemEffectTypeSchema } from "#shared/models/dungeons/item/ItemEffectType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface ItemEffect extends ItemEntityType<ItemEffectType> {
  value: number;
}

export const itemEffectSchema = z.object({
  ...createItemEntityTypeSchema(itemEffectTypeSchema).shape,
  value: z.number(),
}) satisfies z.ZodType<ItemEffect>;
