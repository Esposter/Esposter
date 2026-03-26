import { AColumn, createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
import { booleanColumnFormSchema } from "#shared/models/tableEditor/file/column/BooleanColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { computedColumnFormSchema } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { dateColumnFormSchema } from "#shared/models/tableEditor/file/column/DateColumn";
import { numberColumnFormSchema } from "#shared/models/tableEditor/file/column/NumberColumn";
import { stringColumnFormSchema } from "#shared/models/tableEditor/file/column/StringColumn";
import { z } from "zod";

export interface AColumnForm extends Pick<AColumn<ColumnType>, "description" | "name" | "sourceName" | "type"> {}

export const createAColumnFormSchema = <T extends z.ZodType<ColumnType>>(typeSchema: T) => {
  const baseSchema = createAColumnSchema(typeSchema);
  return baseSchema.pick({ description: true, name: true, sourceName: true }).extend({
    description: baseSchema.shape.description.meta({ title: "Description" }),
    name: baseSchema.shape.name.meta({
      getProps: `{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Column already exists'] }`,
      title: "Column",
    }),
    sourceName: baseSchema.shape.sourceName.meta({ title: "Source Column" }),
    type: typeSchema.meta({ title: "Type" }),
  });
};

export const columnFormSchema = z.discriminatedUnion("type", [
  booleanColumnFormSchema,
  computedColumnFormSchema,
  dateColumnFormSchema,
  numberColumnFormSchema,
  stringColumnFormSchema,
]);
