import type { ColumnStatisticsKey } from "#shared/models/resource/sheet/column/ColumnStatisticsKey";
import type { ColumnStatisticsDefinition } from "@/models/resource/sheet/column/ColumnStatisticsDefinition";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { defineColumnStatistics } from "@/services/resource/sheet/column/defineColumnStatistics";
import { formatOptional } from "@/util/text/formatOptional";

export const ColumnStatisticsDefinitionMap = {
  average: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number],
    compute: ({ nonNullNumbers }) => {
      if (nonNullNumbers.length === 0) return undefined;
      const raw = nonNullNumbers.reduce((summation, value) => summation + value, 0) / nonNullNumbers.length;
      return Math.round(raw * 100) / 100;
    },
    format: formatOptional,
    key: "average",
    title: "Average",
  }),
  falseCount: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Boolean],
    compute: ({ nonNullBooleans }) => nonNullBooleans.filter((value) => !value).length,
    format: formatOptional,
    key: "falseCount",
    title: "False",
  }),
  maximum: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number],
    compute: ({ nonNullNumbers }) =>
      nonNullNumbers.length > 0
        ? nonNullNumbers.reduce((maximum, value) => Math.max(maximum, value), -Infinity)
        : undefined,
    format: formatOptional,
    key: "maximum",
    title: "Maximum",
  }),
  minimum: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number],
    compute: ({ nonNullNumbers }) =>
      nonNullNumbers.length > 0
        ? nonNullNumbers.reduce((minimum, value) => Math.min(minimum, value), Infinity)
        : undefined,
    format: formatOptional,
    key: "minimum",
    title: "Minimum",
  }),
  mostFrequentValue: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.String, ColumnType.Date],
    compute: ({ nonNullStrings }) => {
      if (nonNullStrings.length === 0) return undefined;
      const countMap = new Map<string, number>();
      for (const value of nonNullStrings) countMap.set(value, (countMap.get(value) ?? 0) + 1);
      let mostFrequent: string | undefined = undefined;
      let maxCount = 0;
      for (const [value, count] of countMap)
        if (count > maxCount) {
          maxCount = count;
          mostFrequent = value;
        }

      return mostFrequent;
    },
    format: formatOptional,
    key: "mostFrequentValue",
    sortable: false,
    title: "Most Frequent",
  }),
  nullCount: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String],
    compute: ({ nullCount }) => nullCount,
    format: (value) => value.toString(),
    key: "nullCount",
    title: "Nulls",
  }),
  nullPercent: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String],
    compute: ({ nullCount, values }) =>
      values.length === 0 ? undefined : Math.round((nullCount / values.length) * 1000) / 10,
    format: (value) => (value === undefined ? "—" : `${value}%`),
    key: "nullPercent",
    title: "Null %",
  }),
  standardDeviation: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number],
    compute: ({ nonNullNumbers }) => {
      if (nonNullNumbers.length === 0) return undefined;
      // Use raw (unrounded) mean to avoid rounding error accumulation in the variance sum
      const rawAverage = nonNullNumbers.reduce((summation, value) => summation + value, 0) / nonNullNumbers.length;
      const variance =
        nonNullNumbers.reduce((summation, value) => summation + (value - rawAverage) ** 2, 0) / nonNullNumbers.length;
      return Math.round(Math.sqrt(variance) * 100) / 100;
    },
    format: formatOptional,
    key: "standardDeviation",
    title: "Standard Deviation",
  }),
  summation: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number],
    compute: ({ nonNullNumbers }) =>
      Math.round(nonNullNumbers.reduce((summation, value) => summation + value, 0) * 100) / 100,
    format: formatOptional,
    key: "summation",
    title: "Sum",
  }),
  trueCount: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Boolean],
    compute: ({ nonNullBooleans }) => nonNullBooleans.filter(Boolean).length,
    format: formatOptional,
    key: "trueCount",
    title: "True",
  }),
  uniqueCount: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number, ColumnType.String, ColumnType.Date],
    compute: ({ column, nonNullNumbers, nonNullStrings }) =>
      column.type === ColumnType.Number ? new Set(nonNullNumbers).size : new Set(nonNullStrings).size,
    format: formatOptional,
    key: "uniqueCount",
    title: "Unique",
  }),
} as const satisfies { [K in ColumnStatisticsKey]: ColumnStatisticsDefinition<K> };

export const ColumnStatisticsDefinitions = Object.values(ColumnStatisticsDefinitionMap);
