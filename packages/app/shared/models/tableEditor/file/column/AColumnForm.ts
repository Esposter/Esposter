import type { AColumn } from "#shared/models/tableEditor/file/column/AColumn";
import type { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

import { createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
import { z } from "zod";

export interface AColumnForm<TColumnType extends ColumnType = ColumnType>
  extends Pick<AColumn<TColumnType>, "description" | "name" | "sourceName" | "type"> {}

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
