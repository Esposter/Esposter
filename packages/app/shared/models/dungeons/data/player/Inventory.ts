import type { Item } from "@/models/dungeons/item/Item";
import type { z } from "zod/v4";

import { itemSchema } from "@/models/dungeons/item/Item";

export type Inventory = Item[];

export const inventorySchema = itemSchema.array() satisfies z.ZodType<Inventory>;
