import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationComputeMap } from "@/services/tableEditor/file/column/transformation/ColumnTransformationComputeMap";
import { takeOne } from "@esposter/shared";

export const computeValue = (
  rows: Row[],
  row: Row,
  columns: Column[],
  column: Column,
  rowIndex?: number,
  visited = new Set<string>(),
): ColumnValue => {
  if (column.type !== ColumnType.Computed) return takeOne(row.data, column.name);
  else if (visited.has(column.id)) return null;
  else {
    visited.add(column.id);
    return ColumnTransformationComputeMap[column.transformation.type](column.transformation as never, {
      computeSource: (sourceColumnId) => {
        const sourceColumn = columns.find(({ id }) => id === sourceColumnId);
        if (!sourceColumn) return null;
        return computeValue(rows, row, columns, sourceColumn, rowIndex, visited);
      },
      findSource: (sourceColumnId) => columns.find(({ id }) => id === sourceColumnId),
      rowIndex,
      rows,
    });
  }
};
