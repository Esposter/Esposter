import type { ItemEntityType } from "@esposter/shared";

import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { ColumnType, columnTypeSchema } from "#shared/models/tableEditor/file/ColumnType";
import { z } from "zod";

export class Column extends ATableEditorItemEntity implements ItemEntityType<ColumnType> {
  size = 0;
  readonly sourceName: string = "";
  readonly type: Exclude<ColumnType, ColumnType.Date> = ColumnType.String;

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
