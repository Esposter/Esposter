import type { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import type { ItemEntityType } from "@esposter/shared";

import { ANamedItemEntity, aNamedItemEntitySchema } from "#shared/models/entity/ANamedItemEntity";
import { descriptionSchema } from "#shared/models/entity/Description";
import { MAX_RESOURCE_CONTENT_LENGTH } from "#shared/services/resource/constants";
import { z } from "zod";

export abstract class AColumn<TColumnType extends ColumnType = ColumnType>
  extends ANamedItemEntity
  implements ItemEntityType<TColumnType>
{
  description = "";
  isHidden = false;
  size = 0;
  readonly sourceName: string = "";
  abstract readonly type: TColumnType;

  constructor(init?: Partial<AColumn<TColumnType>>) {
    super();
    Object.assign(this, init);
  }
}

export const createAColumnSchema = <T extends z.ZodType<ColumnType>>(typeSchema: T) =>
  z.object({
    ...aNamedItemEntitySchema.shape,
    ...descriptionSchema.shape,
    isHidden: z.boolean().default(false),
    size: z.int().nonnegative().default(0),
    sourceName: z.string().max(MAX_RESOURCE_CONTENT_LENGTH).default("").readonly(),
    type: typeSchema.readonly(),
  });
