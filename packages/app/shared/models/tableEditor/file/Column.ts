import type { ItemEntityType } from "@esposter/shared";

import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { z } from "zod";

export class Column<TColumnType extends ColumnType = Exclude<ColumnType, ColumnType.Date>>
  extends ATableEditorItemEntity
  implements ItemEntityType<ColumnType>
{
  size = 0;
  readonly sourceName: string = "";
  readonly type: TColumnType = ColumnType.String as TColumnType;

  constructor(init?: Partial<Column>) {
    super();
    Object.assign(this, init);
  }
}

export const createColumnSchema = <T extends z.ZodType<ColumnType>>(typeSchema: T) =>
  z.object({
    ...aTableEditorItemEntitySchema.shape,
    size: z.number().default(0),
    sourceName: z.string().default("").readonly(),
    type: typeSchema.readonly(),
  });

export const columnSchema = createColumnSchema(
  z.enum([ColumnType.Boolean, ColumnType.Number, ColumnType.String]),
);

export const createColumnFormSchema = <T extends z.ZodType<ColumnType>>(typeSchema: T) =>
  columnSchema.pick({ name: true, sourceName: true }).extend({
    name: columnSchema.shape.name.meta({ title: "Column" }),
    sourceName: columnSchema.shape.sourceName.meta({ title: "Source Column" }),
    type: typeSchema.meta({ title: "Type" }),
  });

export const columnFormSchema = createColumnFormSchema(
  z.enum([ColumnType.Boolean, ColumnType.Number, ColumnType.String]),
);
