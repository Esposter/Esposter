import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { Row } from "#shared/models/tableEditor/file/Row";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { type ComputedColumn } from "#shared/models/tableEditor/file/ComputedColumn";
import { evaluateColumnTransformation } from "@/services/tableEditor/file/column/evaluateColumnTransformation";
import { takeOne } from "@esposter/shared";

const isComputedColumn = (column: DataSource["columns"][number]): column is ComputedColumn =>
  column.type === ColumnType.Computed;

export const resolveValue = (
  row: Row,
  columns: DataSource["columns"],
  column: DataSource["columns"][number],
): ColumnValue => {
  if (!isComputedColumn(column)) return takeOne(row.data, column.name) ?? null;
  const sourceColumn = columns.find((candidate) => candidate.id === column.sourceColumnId);
  if (!sourceColumn || sourceColumn.type === ColumnType.Computed) return null;
  const sourceValue = takeOne(row.data, sourceColumn.name) ?? null;
  return evaluateColumnTransformation(sourceValue, column.transformation);
};
