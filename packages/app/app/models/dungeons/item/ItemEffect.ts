import type { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";

import { itemEffectTypeSchema } from "@/models/dungeons/item/ItemEffectType";
import { z } from "zod";

export interface ItemEffect {
  type: ItemEffectType;
  value: number;
}

export const itemEffectSchema = z.interface({
  type: itemEffectTypeSchema,
  value: z.number(),
}) satisfies z.ZodType<ItemEffect>;
