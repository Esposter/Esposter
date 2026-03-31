import type { AggregationTransformationComputeContext } from "@/models/tableEditor/file/column/transformation/AggregationTransformationComputeContext";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

import { AggregationTransformationType } from "#shared/models/tableEditor/file/column/transformation/AggregationTransformationType";
import { takeOne } from "@esposter/shared";

type AggregationTransformationComputer = (context: AggregationTransformationComputeContext) => ColumnValue;

export const AggregationTransformationComputeMap = {
  [AggregationTransformationType.Average]: ({ nonNullValues }) => {
    if (nonNullValues.length === 0) return null;
    return nonNullValues.reduce((sum, value) => sum + value, 0) / nonNullValues.length;
  },
  [AggregationTransformationType.Count]: ({ getNumber, rows }) => rows.filter((row) => getNumber(row) !== null).length,
  [AggregationTransformationType.Maximum]: ({ nonNullValues }) => {
    if (nonNullValues.length === 0) return null;
    return Math.max(...nonNullValues);
  },
  [AggregationTransformationType.Minimum]: ({ nonNullValues }) => {
    if (nonNullValues.length === 0) return null;
    return Math.min(...nonNullValues);
  },
  [AggregationTransformationType.PercentOfTotal]: ({ getNumber, rowIndex, rows }) => {
    const currentValue = getNumber(takeOne(rows, rowIndex));
    if (currentValue === null) return null;
    const total = rows.reduce<number>((sum, row) => {
      const value = getNumber(row);
      return value === null ? sum : sum + value;
    }, 0);
    return total === 0 ? null : (currentValue / total) * 100;
  },
  [AggregationTransformationType.Rank]: ({ getNumber, nonNullValues, rowIndex, rows }) => {
    const currentValue = getNumber(takeOne(rows, rowIndex));
    if (currentValue === null) return null;
    const sorted = nonNullValues.toSorted((a, b) => b - a);
    return sorted.indexOf(currentValue) + 1;
  },
  [AggregationTransformationType.RunningSum]: ({ getNumber, rowIndex, rows }) => {
    let sum = 0;
    for (let index = 0; index <= rowIndex; index++) {
      const value = getNumber(takeOne(rows, index));
      if (value !== null) sum += value;
    }
    return sum;
  },
} as const satisfies Record<AggregationTransformationType, AggregationTransformationComputer>;
