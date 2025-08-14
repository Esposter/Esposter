import type { Item } from "#shared/models/dungeons/item/Item";
import type { z } from "zod";

import { itemSchema } from "#shared/models/dungeons/item/Item";

export type Inventory = Item[];

export const inventorySchema = itemSchema.array() satisfies z.ZodType<Inventory>;
