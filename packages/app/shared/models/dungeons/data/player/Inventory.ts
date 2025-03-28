import type { Item } from "@/models/dungeons/item/Item";

import { itemSchema } from "@/models/dungeons/item/Item";
import { z } from "zod";

export type Inventory = Item[];

export const inventorySchema = z.array(itemSchema) as const satisfies z.ZodType<Inventory>;
