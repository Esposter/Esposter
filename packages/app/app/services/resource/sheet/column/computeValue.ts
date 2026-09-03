import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ColumnTransformationComputeMap } from "@/services/resource/sheet/column/transformation/ColumnTransformationComputeMap";
import { takeOne } from "@esposter/shared";

export const computeValue = (
  rows: Row[],
  row: Row,
  columns: Column[],
  column: Column,
  rowIndex?: number,
  visitedColumnIds = new Set<string>(),
): ColumnValue => {
  if (column.type !== ColumnType.Computed) return takeOne(row.data, column.name);
  else if (visitedColumnIds.has(column.id)) return null;
  else {
    visitedColumnIds.add(column.id);
    return ColumnTransformationComputeMap[column.transformation.type](column.transformation as never, {
      computeSource: (sourceColumnId) => {
        const sourceColumn = columns.find(({ id }) => id === sourceColumnId);
        if (!sourceColumn) return null;
        return computeValue(rows, row, columns, sourceColumn, rowIndex, visitedColumnIds);
      },
      findSource: (sourceColumnId) => columns.find(({ id }) => id === sourceColumnId),
      rowIndex,
      rows,
    });
  }
};
