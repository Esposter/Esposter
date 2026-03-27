import type { AggregationColumn } from "#shared/models/tableEditor/file/column/AggregationColumn";
import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { AggregationTransformationType } from "#shared/models/tableEditor/file/column/AggregationTransformationType";
import { exhaustiveGuard, takeOne } from "@esposter/shared";

export const computeAggregationValue = (
  rows: Row[],
  columns: Column[],
  column: AggregationColumn,
  rowIndex: number,
): ColumnValue => {
  const sourceColumn = columns.find(({ id }) => id === column.sourceColumnId);
  if (!sourceColumn) return null;

  const getNumber = (row: Row): null | number => {
    const value = takeOne(row.data, sourceColumn.name);
    return typeof value === "number" ? value : null;
  };

  switch (column.aggregationType) {
    case AggregationTransformationType.PercentOfTotal: {
      const currentValue = getNumber(takeOne(rows, rowIndex));
      if (currentValue === null) return null;
      const total = rows.reduce<number>((sum, row) => {
        const value = getNumber(row);
        return value === null ? sum : sum + value;
      }, 0);
      return total === 0 ? null : (currentValue / total) * 100;
    }
    case AggregationTransformationType.Rank: {
      const currentValue = getNumber(takeOne(rows, rowIndex));
      if (currentValue === null) return null;
      const allValues = rows.map((row) => getNumber(row)).filter((value): value is number => value !== null);
      const sorted = [...allValues].toSorted((a, b) => b - a);
      return sorted.indexOf(currentValue) + 1;
    }
    case AggregationTransformationType.RunningSum: {
      let sum = 0;
      for (let index = 0; index <= rowIndex; index++) {
        const value = getNumber(takeOne(rows, index));
        if (value !== null) sum += value;
      }
      return sum;
    }
    default:
      return exhaustiveGuard(column.aggregationType);
  }
};
