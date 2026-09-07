import type { ToData } from "@esposter/shared";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { DEFAULT_NAME } from "#shared/services/constants";
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { createNameSchema } from "@esposter/db-schema";
import { z } from "zod";

export abstract class ANamedItemEntity extends AItemEntity {
  name = DEFAULT_NAME;
}

export const aNamedItemEntitySchema = z.object({
  ...aItemEntitySchema.shape,
  name: createNameSchema(ITEM_NAME_MAX_LENGTH),
}) satisfies z.ZodType<ToData<ANamedItemEntity>>;
