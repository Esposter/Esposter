import type { Except } from "type-fest";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { DEFAULT_NAME } from "#shared/services/constants";
import { z } from "zod";

export abstract class ATableEditorItemEntity extends AItemEntity {
  name = DEFAULT_NAME;
}

export const aTableEditorItemEntitySchema = aItemEntitySchema.merge(
  z.object({
    name: z.string().min(1),
  }),
) satisfies z.ZodType<Except<ATableEditorItemEntity, "toJSON">>;
