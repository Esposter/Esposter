import type { ANamedItemEntity } from "#shared/models/entity/ANamedItemEntity";
import type { ItemEntityType, ToData } from "@esposter/shared";

import { aNamedItemEntitySchema } from "#shared/models/entity/ANamedItemEntity";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";
// This is not directly used when creating new classes
// But is only used as a convenient wrapper type for helper functions
// To enforce that all entities implement Item
export type Item = ANamedItemEntity & ItemEntityType<string>;

export const itemSchema = z.object({
  ...aNamedItemEntitySchema.shape,
  ...createItemEntityTypeSchema(z.string()).shape,
}) satisfies z.ZodType<ToData<Item>>;
