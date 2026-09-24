import type { AggregationTransformationComputer } from "@/models/resource/sheet/column/transformation/AggregationTransformationComputer";

import { AggregationTransformationType } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationType";
import { getAverage } from "@/services/resource/sheet/column/getAverage";
import { getSummation } from "@/services/resource/sheet/column/getSummation";
import { takeOne } from "@esposter/shared";

export const AggregationTransformationComputeMap = {
  [AggregationTransformationType.Average]: ({ nonNullValues }) => {
    if (nonNullValues.length === 0) return null;
    else return getAverage(nonNullValues);
  },
  [AggregationTransformationType.Count]: ({ nonNullValues }) => nonNullValues.length,
  [AggregationTransformationType.Maximum]: ({ nonNullValues }) => {
    if (nonNullValues.length === 0) return null;
    // Reduce rather than Math.max(...values): a whole column spread as arguments throws past the engine's limit
    else return nonNullValues.reduce((maximum, value) => Math.max(maximum, value), -Infinity);
  },
  [AggregationTransformationType.Minimum]: ({ nonNullValues }) => {
    if (nonNullValues.length === 0) return null;
    else return nonNullValues.reduce((minimum, value) => Math.min(minimum, value), Infinity);
  },
  [AggregationTransformationType.PercentOfTotal]: ({ nonNullValues, numbers, rowIndex }) => {
    const rowValue = takeOne(numbers, rowIndex);
    if (rowValue === null) return null;
    const total = getSummation(nonNullValues);
    return total === 0 ? null : (rowValue / total) * 100;
  },
  [AggregationTransformationType.Rank]: ({ nonNullValues, numbers, rowIndex }) => {
    const rowValue = takeOne(numbers, rowIndex);
    if (rowValue === null) return null;
    else return nonNullValues.filter((value) => value > rowValue).length + 1;
  },
  [AggregationTransformationType.RunningSummation]: ({ numbers, rowIndex }) =>
    getSummation(numbers.slice(0, rowIndex + 1).filter((value) => value !== null)),
} as const satisfies Record<AggregationTransformationType, AggregationTransformationComputer>;
