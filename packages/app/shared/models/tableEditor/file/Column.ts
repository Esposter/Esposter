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

export const columnSchema = z.object({
  ...aTableEditorItemEntitySchema.shape,
  size: z.number().default(0),
  sourceName: z.string().readonly(),
  type: z.enum([ColumnType.Boolean, ColumnType.Number, ColumnType.String]).readonly(),
});

export const columnFormSchema = columnSchema.pick({ name: true, sourceName: true, type: true }).extend({
  name: columnSchema.shape.name.meta({ title: "Field" }),
  sourceName: columnSchema.shape.sourceName.meta({ title: "Source Field" }),
  type: columnSchema.shape.type.meta({ title: "Type" }),
});
