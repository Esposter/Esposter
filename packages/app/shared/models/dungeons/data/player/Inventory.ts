import type { Item } from "@/models/dungeons/item/Item";

import { itemSchema } from "@/models/dungeons/item/Item";
import { z } from "zod";

export type Inventory = Item[];

export const inventorySchema = itemSchema.array() satisfies z.ZodType<Inventory>;
