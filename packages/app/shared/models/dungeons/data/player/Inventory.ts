import type { Item } from "@/models/dungeons/item/Item";
import type { Type } from "arktype";

import { itemSchema } from "@/models/dungeons/item/Item";

export type Inventory = Item[];

export const inventorySchema = itemSchema.array() satisfies Type<Inventory>;
