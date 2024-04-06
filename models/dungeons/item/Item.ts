import type { ItemEffect } from "@/models/dungeons/item/ItemEffect";
import { itemEffectSchema } from "@/models/dungeons/item/ItemEffect";
import type { ItemId } from "@/models/dungeons/item/ItemId";
import { itemIdSchema } from "@/models/dungeons/item/ItemId";
import { z } from "zod";

export interface Item {
  id: ItemId;
  name: string;
  description: string;
  quantity: number;
  effect: ItemEffect;
}

export const itemSchema = z.object({
  id: itemIdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  quantity: z.number().positive(),
  effect: itemEffectSchema,
}) satisfies z.ZodType<Item>;
