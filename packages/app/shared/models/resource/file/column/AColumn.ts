import type { ItemEntityType } from "@esposter/shared";

import { ANamedItemEntity, aNamedItemEntitySchema } from "#shared/models/entity/ANamedItemEntity";
import { descriptionSchema } from "#shared/models/entity/Description";
import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { z } from "zod";

export abstract class AColumn<TColumnType extends ColumnType = ColumnType>
  extends ANamedItemEntity
  implements ItemEntityType<TColumnType>
{
  description = "";
  hidden = false;
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
    hidden: z.boolean().default(false),
    size: z.number().default(0),
    sourceName: z.string().default("").readonly(),
    type: typeSchema.readonly(),
  });
