import type { ToData } from "#shared/models/entity/ToData";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { DEFAULT_NAME } from "#shared/services/constants";
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/tableEditor/constants";
import { z } from "zod";

export abstract class ATableEditorItemEntity extends AItemEntity {
  name = DEFAULT_NAME;
}

export const aTableEditorItemEntitySchema = aItemEntitySchema.extend(
  z.object({
    name: z.string().min(1).max(ITEM_NAME_MAX_LENGTH),
  }),
) satisfies z.ZodType<ToData<ATableEditorItemEntity>>;
