import type { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";

import { itemEffectTypeSchema } from "@/models/dungeons/item/ItemEffectType";
import { z } from "zod";

export interface ItemEffect {
  type: ItemEffectType;
  value: number;
}

export const itemEffectSchema = z.object({
  type: itemEffectTypeSchema,
  value: z.number(),
}) as const satisfies z.ZodType<ItemEffect>;
