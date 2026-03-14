import type { ItemEntityType } from "@esposter/shared";

import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DESCRIPTION_MAX_LENGTH } from "#shared/services/constants";
import { z } from "zod";

export class Column<TColumnType extends ColumnType = Exclude<ColumnType, ColumnType.Date>>
  extends ATableEditorItemEntity
  implements ItemEntityType<ColumnType>
{
  description = "";
  hidden = false;
  size = 0;
  readonly sourceName: string = "";
  readonly type: TColumnType = ColumnType.String as TColumnType;

  constructor(init?: Partial<Column<TColumnType>>) {
    super();
    Object.assign(this, init);
  }
}

export const createColumnSchema = <T extends z.ZodType<ColumnType>>(typeSchema: T) =>
  z.object({
    ...aTableEditorItemEntitySchema.shape,
    description: z.string().max(DESCRIPTION_MAX_LENGTH).default(""),
    hidden: z.boolean().default(false),
    size: z.number().default(0),
    sourceName: z.string().default("").readonly(),
    type: typeSchema.readonly(),
  });

export const columnSchema = createColumnSchema(z.enum([ColumnType.Boolean, ColumnType.Number, ColumnType.String]));
