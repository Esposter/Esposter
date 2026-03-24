import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { computeColumnTransformation } from "@/services/tableEditor/file/column/transformation/computeColumnTransformation";
import { takeOne } from "@esposter/shared";

const isComputedColumn = (column: DataSource["columns"][number]): column is ComputedColumn =>
  column.type === ColumnType.Computed;

export const resolveValue = (
  row: Row,
  columns: DataSource["columns"],
  column: DataSource["columns"][number],
): ColumnValue => {
  if (!isComputedColumn(column)) return takeOne(row.data, column.name);
  const sourceColumn = columns.find(({ id }) => id === column.transformation.sourceColumnId);
  if (!sourceColumn || sourceColumn.type === ColumnType.Computed) return null;
  const sourceValue = takeOne(row.data, sourceColumn.name);
  return computeColumnTransformation(sourceValue, column.transformation);
};
