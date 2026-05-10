import type { ItemEntityType } from "@esposter/shared";

import { descriptionSchema } from "#shared/models/entity/Description";
import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { z } from "zod";

export abstract class AColumn<TColumnType extends ColumnType = ColumnType>
  extends ATableEditorItemEntity
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
    ...aTableEditorItemEntitySchema.shape,
    ...descriptionSchema.shape,
    hidden: z.boolean().default(false),
    size: z.number().default(0),
    sourceName: z.string().default("").readonly(),
    type: typeSchema.readonly(),
  });
