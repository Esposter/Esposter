import type { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import type { Type } from "arktype";

import { itemEffectTypeSchema } from "@/models/dungeons/item/ItemEffectType";
import { type } from "arktype";

export interface ItemEffect {
  type: ItemEffectType;
  value: number;
}

export const itemEffectSchema = type({
  type: itemEffectTypeSchema,
  value: "number",
}) satisfies Type<ItemEffect>;
