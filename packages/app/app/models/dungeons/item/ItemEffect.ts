import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";

import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";
import { itemEffectTypeSchema } from "@/models/dungeons/item/ItemEffectType";
import { z } from "zod";

export interface ItemEffect extends ItemEntityType<ItemEffectType> {
  value: number;
}

export const itemEffectSchema = createItemEntityTypeSchema(itemEffectTypeSchema).extend(
  z.interface({
    value: z.number(),
  }),
) satisfies z.ZodType<ItemEffect>;
