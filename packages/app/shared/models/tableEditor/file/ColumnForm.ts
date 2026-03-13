import { columnSchema, createColumnSchema } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { z } from "zod";

export interface ColumnForm {
  name: string;
  readonly sourceName: string;
  type: ColumnType;
}

export const createColumnFormSchema = <T extends z.ZodType<ColumnType>>(typeSchema: T) =>
  columnSchema.pick({ name: true, sourceName: true }).extend({
    name: columnSchema.shape.name.meta({ title: "Column" }),
    sourceName: columnSchema.shape.sourceName.meta({ title: "Source Column" }),
    type: typeSchema.meta({ title: "Type" }),
  });

export const columnFormSchema = createColumnFormSchema(
  z.enum([ColumnType.Boolean, ColumnType.Number, ColumnType.String]).readonly(),
) satisfies z.ZodType<ColumnForm>;
