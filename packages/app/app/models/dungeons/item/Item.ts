import type { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import type { ItemEffect } from "@/models/dungeons/item/ItemEffect";

import { itemEffectSchema } from "@/models/dungeons/item/ItemEffect";
import { itemIdSchema } from "@/models/dungeons/item/ItemId";
import { z } from "zod";

export interface Item {
  description: string;
  effect: ItemEffect;
  id: ItemId;
  quantity: number;
}

export const itemSchema = z.object({
  description: z.string().min(1),
  effect: itemEffectSchema,
  id: itemIdSchema,
  quantity: z.int().positive(),
}) satisfies z.ZodType<Item>;
