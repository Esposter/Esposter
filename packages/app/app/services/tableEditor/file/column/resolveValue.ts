import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationResolveMap } from "@/services/tableEditor/file/column/transformation/ColumnTransformationResolveMap";
import { takeOne } from "@esposter/shared";

const isComputedColumn = (column: DataSource["columns"][number]): column is ComputedColumn =>
  column.type === ColumnType.Computed;

export const resolveValue = (
  row: Row,
  columns: DataSource["columns"],
  column: DataSource["columns"][number],
  visited = new Set<string>(),
): ColumnValue => {
  if (!isComputedColumn(column)) return takeOne(row.data, column.name);
  else if (visited.has(column.id)) return null;
  else {
    visited.add(column.id);
    return ColumnTransformationResolveMap[column.transformation.type](column.transformation as never, {
      findSource: (sourceColumnId) => columns.find(({ id }) => id === sourceColumnId),
      resolveSource: (sourceColumnId) => {
        const sourceColumn = columns.find(({ id }) => id === sourceColumnId);
        if (!sourceColumn) return null;
        return resolveValue(row, columns, sourceColumn, visited);
      },
    });
  }
};
