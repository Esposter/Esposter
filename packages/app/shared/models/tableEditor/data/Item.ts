import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { ToData } from "#shared/models/entity/ToData";
import type { ATableEditorItemEntity } from "#shared/models/tableEditor/data/ATableEditorItemEntity";

import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";
import { aTableEditorItemEntitySchema } from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { z } from "zod";
// This is not directly used when creating new classes
// but is only used as a convenient wrapper type for helper functions
// to enforce that all entities implement Item
export type Item = ATableEditorItemEntity & ItemEntityType<string>;

export const itemSchema = z.object({
  ...aTableEditorItemEntitySchema.shape,
  ...createItemEntityTypeSchema(z.string()).shape,
}) satisfies z.ZodType<ToData<Item>>;
