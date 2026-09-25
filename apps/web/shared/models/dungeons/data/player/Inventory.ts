import type { Item } from "#shared/models/dungeons/item/Item";
import type { z } from "zod";

import { itemSchema } from "#shared/models/dungeons/item/Item";
import { itemIdSchema } from "#shared/models/dungeons/item/ItemId";
import { createUniqueArraySchema } from "@esposter/shared";

export type Inventory = Item[];

// Unique by item id, so the item enum's size is the most it can hold
export const inventorySchema = createUniqueArraySchema(itemSchema, "id").max(
  itemIdSchema.options.length,
) satisfies z.ZodType<Inventory>;
