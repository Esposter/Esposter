import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { AggregationTransformation } from "#shared/models/tableEditor/file/column/transformation/AggregationTransformation";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { AggregationTransformationType } from "#shared/models/tableEditor/file/column/transformation/AggregationTransformationType";
import { takeOne } from "@esposter/shared";

interface AggregationComputeContext {
  getNumber: (row: Row) => null | number;
  rowIndex: number;
  rows: Row[];
}

type AggregationTransformationComputer = (context: AggregationComputeContext) => ColumnValue;

const AggregationTransformationComputeMap = {
  [AggregationTransformationType.PercentOfTotal]: ({ rows, rowIndex, getNumber }) => {
    const currentValue = getNumber(takeOne(rows, rowIndex));
    if (currentValue === null) return null;
    const total = rows.reduce<number>((sum, row) => {
      const value = getNumber(row);
      return value === null ? sum : sum + value;
    }, 0);
    return total === 0 ? null : (currentValue / total) * 100;
  },
  [AggregationTransformationType.Rank]: ({ rows, rowIndex, getNumber }) => {
    const currentValue = getNumber(takeOne(rows, rowIndex));
    if (currentValue === null) return null;
    const allValues = rows.map((row) => getNumber(row)).filter((value) => value !== null);
    const sorted = allValues.toSorted((a, b) => b - a);
    return sorted.indexOf(currentValue) + 1;
  },
  [AggregationTransformationType.RunningSum]: ({ rows, rowIndex, getNumber }) => {
    let sum = 0;
    for (let index = 0; index <= rowIndex; index++) {
      const value = getNumber(takeOne(rows, index));
      if (value !== null) sum += value;
    }
    return sum;
  },
} as const satisfies Record<AggregationTransformationType, AggregationTransformationComputer>;

export const computeAggregationValue = (
  rows: Row[],
  findSource: (sourceColumnId: string) => Column | undefined,
  transformation: AggregationTransformation,
  rowIndex: number,
): ColumnValue => {
  const sourceColumn = findSource(transformation.sourceColumnId);
  if (!sourceColumn) return null;

  const getNumber = (row: Row): null | number => {
    const value = takeOne(row.data, sourceColumn.name);
    return typeof value === "number" ? value : null;
  };

  return AggregationTransformationComputeMap[transformation.aggregationType]({ getNumber, rowIndex, rows });
};
