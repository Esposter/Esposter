import type { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import type { ItemEffect } from "@/models/dungeons/item/ItemEffect";
import type { Type } from "arktype";

import { itemEffectSchema } from "@/models/dungeons/item/ItemEffect";
import { itemIdSchema } from "@/models/dungeons/item/ItemId";
import { type } from "arktype";

export interface Item {
  description: string;
  effect: ItemEffect;
  id: ItemId;
  quantity: number;
}

export const itemSchema = type({
  description: "string > 0",
  effect: itemEffectSchema,
  id: itemIdSchema,
  quantity: "number.integer > 0",
}) satisfies Type<Item>;
