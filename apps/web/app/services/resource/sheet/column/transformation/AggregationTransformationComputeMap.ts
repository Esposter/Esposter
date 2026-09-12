import type { AggregationTransformationComputer } from "@/models/resource/sheet/column/transformation/AggregationTransformationComputer";

import { AggregationTransformationType } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationType";
import { getAverage } from "@/services/resource/sheet/column/getAverage";
import { getSummation } from "@/services/resource/sheet/column/getSummation";
import { takeOne } from "@esposter/shared";

export const AggregationTransformationComputeMap = {
  [AggregationTransformationType.Average]: ({ nonNullValues }) => {
    if (nonNullValues.length === 0) return null;
    return getAverage(nonNullValues);
  },
  [AggregationTransformationType.Count]: ({ nonNullValues }) => nonNullValues.length,
  [AggregationTransformationType.Maximum]: ({ nonNullValues }) => {
    if (nonNullValues.length === 0) return null;
    // Reduce rather than Math.max(...values): a whole column spread as arguments throws past the engine's limit
    return nonNullValues.reduce((maximum, value) => Math.max(maximum, value), -Infinity);
  },
  [AggregationTransformationType.Minimum]: ({ nonNullValues }) => {
    if (nonNullValues.length === 0) return null;
    return nonNullValues.reduce((minimum, value) => Math.min(minimum, value), Infinity);
  },
  [AggregationTransformationType.PercentOfTotal]: ({ nonNullValues, numbers, rowIndex }) => {
    const currentValue = takeOne(numbers, rowIndex);
    if (currentValue === null) return null;
    const total = getSummation(nonNullValues);
    return total === 0 ? null : (currentValue / total) * 100;
  },
  [AggregationTransformationType.Rank]: ({ nonNullValues, numbers, rowIndex }) => {
    const currentValue = takeOne(numbers, rowIndex);
    if (currentValue === null) return null;
    return nonNullValues.filter((value) => value > currentValue).length + 1;
  },
  [AggregationTransformationType.RunningSummation]: ({ numbers, rowIndex }) =>
    getSummation(numbers.slice(0, rowIndex + 1).filter((value) => value !== null)),
} as const satisfies Record<AggregationTransformationType, AggregationTransformationComputer>;
