import { Column, columnSchema } from "#shared/models/tableEditor/file/column/Column";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { z } from "zod";

export interface ColumnForm extends Pick<Column<ColumnType>, "description" | "name" | "sourceName" | "type"> {}

export const createColumnFormSchema = <T extends z.ZodType<ColumnType>>(typeSchema: T) =>
  columnSchema.pick({ description: true, name: true, sourceName: true }).extend({
    description: columnSchema.shape.description.meta({ title: "Description" }),
    name: columnSchema.shape.name.meta({
      getProps: `{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Column already exists'] }`,
      title: "Column",
    }),
    sourceName: columnSchema.shape.sourceName.meta({ title: "Source Column" }),
    type: typeSchema.meta({ title: "Type" }),
  });

export const columnFormSchema = createColumnFormSchema(
  z.enum([ColumnType.Boolean, ColumnType.Number, ColumnType.String]).readonly(),
).meta({ title: "Standard" }) satisfies z.ZodType<ColumnForm>;
