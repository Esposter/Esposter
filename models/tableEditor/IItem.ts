import { createIItemTypeSchema, IItemType } from "@/models/tableEditor/IItemType";
import { Item, itemSchema } from "@/models/tableEditor/Item";
import { ItemType, itemTypeSchema } from "@/models/tableEditor/ItemType";
import { z } from "zod";

// This is not directly used when creating new classes
// but is only used as a convenient wrapper type for helper functions
// to enforce that all entities implement IItem
export type IItem = Item & IItemType<ItemType>;

export const iItemSchema = itemSchema.merge(createIItemTypeSchema(itemTypeSchema)) satisfies z.ZodType<IItem>;
