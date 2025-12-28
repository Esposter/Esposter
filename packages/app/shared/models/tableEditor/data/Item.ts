import type { ATableEditorItemEntity } from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import type { ItemEntityType, ToData } from "@esposter/shared";

import { aTableEditorItemEntitySchema } from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";
// This is not directly used when creating new classes
// But is only used as a convenient wrapper type for helper functions
// To enforce that all entities implement Item
export type Item = ATableEditorItemEntity & ItemEntityType<string>;

export const itemSchema = z.object({
  ...aTableEditorItemEntitySchema.shape,
  ...createItemEntityTypeSchema(z.string()).shape,
}) satisfies z.ZodType<ToData<Item>>;
