import type { AggregationTransformationComputer } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationComputer";

import { AggregationTransformationType } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationType";
import { getAverage } from "#shared/services/resource/sheet/column/getAverage";
import { getSummation } from "#shared/services/resource/sheet/column/getSummation";
import { takeOne } from "@esposter/shared";

export const AggregationTransformationComputeMap = {
  [AggregationTransformationType.Average]: ({ nonNullValues }) => {
    const average = nonNullValues.length === 0 ? null : getAverage(nonNullValues);
    return () => average;
  },
  [AggregationTransformationType.Count]:
    ({ nonNullValues }) =>
    () =>
      nonNullValues.length,
  [AggregationTransformationType.Maximum]: ({ nonNullValues }) => {
    // Reduce rather than Math.max(...values): a whole column spread as arguments throws past the engine's limit
    const maximum =
      nonNullValues.length === 0 ? null : nonNullValues.reduce((largest, value) => Math.max(largest, value), -Infinity);
    return () => maximum;
  },
  [AggregationTransformationType.Minimum]: ({ nonNullValues }) => {
    const minimum =
      nonNullValues.length === 0
        ? null
        : nonNullValues.reduce((smallest, value) => Math.min(smallest, value), Infinity);
    return () => minimum;
  },
  [AggregationTransformationType.PercentOfTotal]: ({ nonNullValues, numbers }) => {
    const total = getSummation(nonNullValues);
    return (rowIndex) => {
      const rowValue = takeOne(numbers, rowIndex);
      if (rowValue === null || total === 0) return null;
      else return (rowValue / total) * 100;
    };
  },
  [AggregationTransformationType.Rank]: ({ nonNullValues, numbers }) => {
    // A value's rank is one past the count of values above it, which is its first position sorted descending
    const valueRankMap = new Map<number, number>();
    for (const [index, value] of nonNullValues
      .toSorted((firstValue, secondValue) => secondValue - firstValue)
      .entries())
      if (!valueRankMap.has(value)) valueRankMap.set(value, index + 1);
    return (rowIndex) => {
      const rowValue = takeOne(numbers, rowIndex);
      if (rowValue === null) return null;
      else return valueRankMap.get(rowValue) ?? null;
    };
  },
  [AggregationTransformationType.RunningSummation]: ({ numbers }) => {
    let runningSummation = 0;
    const runningSummations = numbers.map((value) => (runningSummation += value ?? 0));
    return (rowIndex) => runningSummations[rowIndex] ?? 0;
  },
} as const satisfies Record<AggregationTransformationType, AggregationTransformationComputer>;
