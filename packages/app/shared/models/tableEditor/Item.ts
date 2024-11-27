import type { ItemEntityType } from "@/shared/models/entity/ItemEntityType";
import type { ATableEditorItemEntity } from "@/shared/models/tableEditor/ATableEditorItemEntity";
import type { Except } from "type-fest";

import { createItemEntityTypeSchema } from "@/shared/models/entity/ItemEntityType";
import { aTableEditorItemEntitySchema } from "@/shared/models/tableEditor/ATableEditorItemEntity";
import { z } from "zod";

// This is not directly used when creating new classes
// but is only used as a convenient wrapper type for helper functions
// to enforce that all entities implement Item
export type Item = ATableEditorItemEntity & ItemEntityType<string>;

export const itemSchema = aTableEditorItemEntitySchema.merge(
  createItemEntityTypeSchema(z.string()),
) satisfies z.ZodType<Except<Item, "toJSON">>;
