import type { ItemEntityType } from "@/models/shared/entity/ItemEntityType";
import { createItemEntityTypeSchema } from "@/models/shared/entity/ItemEntityType";
import type { ATableEditorItemEntity } from "@/models/tableEditor/ATableEditorItemEntity";
import { aTableEditorItemEntitySchema } from "@/models/tableEditor/ATableEditorItemEntity";
import { z } from "zod";

// This is not directly used when creating new classes
// but is only used as a convenient wrapper type for helper functions
// to enforce that all entities implement Item
export type Item = ATableEditorItemEntity & ItemEntityType<string>;

export const itemSchema = aTableEditorItemEntitySchema.merge(
  createItemEntityTypeSchema(z.string()),
) satisfies z.ZodType<Item>;
