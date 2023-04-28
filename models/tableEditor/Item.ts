import { AItemEntity, aItemEntitySchema } from "@/models/tableEditor/AItemEntity";
import { ItemEntityType, createItemEntityTypeSchema } from "@/models/tableEditor/ItemEntityType";
import { ItemType, itemTypeSchema } from "@/models/tableEditor/ItemType";
import { z } from "zod";

// This is not directly used when creating new classes
// but is only used as a convenient wrapper type for helper functions
// to enforce that all entities implement Item
export type Item = AItemEntity & ItemEntityType<ItemType>;

export const itemSchema = aItemEntitySchema.merge(createItemEntityTypeSchema(itemTypeSchema)) satisfies z.ZodType<Item>;
