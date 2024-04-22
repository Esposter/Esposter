import type { ItemEffect } from "@/models/dungeons/item/ItemEffect";
import { itemEffectSchema } from "@/models/dungeons/item/ItemEffect";
import type { ItemId } from "@/models/dungeons/item/ItemId";
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
