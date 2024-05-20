import type { ItemId } from "@/generated/tiled/propertyTypes/enum/ItemId";
import type { ItemEffect } from "@/models/dungeons/item/ItemEffect";
import { itemEffectSchema } from "@/models/dungeons/item/ItemEffect";
import { itemIdSchema } from "@/models/dungeons/item/ItemId";
import { z } from "zod";

export interface Item {
  id: ItemId;
  description: string;
  quantity: number;
  effect: ItemEffect;
}

export const itemSchema = z.object({
  id: itemIdSchema,
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  effect: itemEffectSchema,
}) satisfies z.ZodType<Item>;
