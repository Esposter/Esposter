import type { Item } from "#shared/models/dungeons/item/Item";
import type { z } from "zod";

import { itemSchema } from "#shared/models/dungeons/item/Item";
import { createUniqueArraySchema } from "@esposter/shared";

export type Inventory = Item[];

export const inventorySchema = createUniqueArraySchema(itemSchema, "id") satisfies z.ZodType<Inventory>;
