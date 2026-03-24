import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { ColumnTypeFormSchemaMap } from "#shared/models/tableEditor/file/column/ColumnTypeFormSchemaMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";

const GET_PROPS = `{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Column already exists'] }`;

export const useColumnTypeFormJsonSchema = (
  column: MaybeRefOrGetter<DataSource["columns"][number]>,
  dataSource: MaybeRefOrGetter<DataSource>,
) => {
  const jsonSchema = computed(() => {
    const columnValue = toValue(column);
    const schema = ColumnTypeFormSchemaMap[columnValue.type];
    return zodToJsonSchema(schema.extend({ name: schema.shape.name.meta({ getProps: GET_PROPS }) }));
  });
  const options = computed(() => ({
    context: {
      columnNames: toValue(dataSource).columns.map(({ name }) => name),
      currentName: toValue(column).name,
    },
  }));
  return { jsonSchema, options };
};
