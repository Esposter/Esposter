import type { columnFormSchema } from "#shared/models/tableEditor/file/Column";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { z } from "zod";

import { ColumnTypeFormSchemaMap } from "#shared/models/tableEditor/file/ColumnTypeFormSchemaMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";

export const useColumnTypeFormJsonSchema = (column: MaybeRefOrGetter<DataSource["columns"][number]>) => {
  const { dataSource } = useEditedItemDataSource();
  return computed(() => {
    const columnValue = toValue(column);
    const schema = ColumnTypeFormSchemaMap[columnValue.type];
    const uniqueColumnNameRule = (value: z.infer<typeof columnFormSchema.shape.name>) =>
      value === columnValue.name ||
      !dataSource.value?.columns.some(({ name }) => name === value) ||
      "Column already exists";
    return zodToJsonSchema(schema.extend({ name: schema.shape.name.meta({ rules: [uniqueColumnNameRule] }) }));
  });
};
