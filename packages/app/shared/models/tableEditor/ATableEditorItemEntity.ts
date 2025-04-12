import type { ToData } from "#shared/models/entity/ToData";
import type { Type } from "arktype";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { DEFAULT_NAME } from "#shared/services/constants";
import { type } from "arktype";

export abstract class ATableEditorItemEntity extends AItemEntity {
  name = DEFAULT_NAME;
}

export const aTableEditorItemEntitySchema = aItemEntitySchema.merge(
  type({
    name: "string > 0",
  }),
) satisfies Type<ToData<ATableEditorItemEntity>>;
