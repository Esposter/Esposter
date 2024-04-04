import type { ItemId } from "@/models/dungeons/item/ItemId";
import { itemIdSchema } from "@/models/dungeons/item/ItemId";
import { z } from "zod";

export interface Item {
  id: ItemId;
  name: string;
  description: string;
  quantity: number;
}

export const itemSchema = z.object({
  id: itemIdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  quantity: z.number().positive(),
}) satisfies z.ZodType<Item>;
