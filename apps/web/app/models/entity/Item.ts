import type { ANamedItemEntity } from "#shared/models/entity/ANamedItemEntity";
import type { ItemEntityType, ToData } from "@esposter/shared";

import { aNamedItemEntitySchema } from "#shared/models/entity/ANamedItemEntity";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";
// Not a base to extend: it is the constraint a helper takes so every entity it accepts implements Item
export type Item = ANamedItemEntity & ItemEntityType<string>;

export const itemSchema = z.object({
  ...aNamedItemEntitySchema.shape,
  ...createItemEntityTypeSchema(z.string()).shape,
}) satisfies z.ZodType<ToData<Item>>;
