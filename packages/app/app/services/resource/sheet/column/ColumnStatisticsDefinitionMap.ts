import type { ColumnStatisticsKey } from "#shared/models/resource/sheet/column/ColumnStatisticsKey";
import type { ColumnStatisticsDefinition } from "@/models/resource/sheet/column/ColumnStatisticsDefinition";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { defineColumnStatistics } from "@/services/resource/sheet/column/defineColumnStatistics";
import { formatOptionalColumnValue } from "@/services/resource/sheet/column/formatOptionalColumnValue";
import { getAverage } from "@/services/resource/sheet/column/getAverage";
import { getSummation } from "@/services/resource/sheet/column/getSummation";
import { formatOptional } from "@/util/text/formatOptional";

export const ColumnStatisticsDefinitionMap = {
  average: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number],
    compute: ({ nonNullNumbers }) => {
      if (nonNullNumbers.length === 0) return undefined;
      return Math.round(getAverage(nonNullNumbers) * 100) / 100;
    },
    format: formatOptionalColumnValue,
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
    format: formatOptionalColumnValue,
    key: "maximum",
    title: "Maximum",
  }),
  minimum: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number],
    compute: ({ nonNullNumbers }) =>
      nonNullNumbers.length > 0
        ? nonNullNumbers.reduce((minimum, value) => Math.min(minimum, value), Infinity)
        : undefined,
    format: formatOptionalColumnValue,
    key: "minimum",
    title: "Minimum",
  }),
  mostFrequentValue: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.String, ColumnType.Date],
    compute: ({ stringCountMap }) => {
      let mostFrequentValue: string | undefined = undefined;
      let maximumCount = 0;
      for (const [value, count] of stringCountMap)
        if (count > maximumCount) {
          maximumCount = count;
          mostFrequentValue = value;
        }

      return mostFrequentValue;
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
  nullPercentage: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String],
    compute: ({ nullCount, values }) =>
      values.length === 0 ? undefined : Math.round((nullCount / values.length) * 1000) / 10,
    format: (value) => (value === undefined ? "—" : `${value}%`),
    key: "nullPercentage",
    title: "Null %",
  }),
  standardDeviation: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number],
    compute: ({ nonNullNumbers }) => {
      if (nonNullNumbers.length === 0) return undefined;
      // Use raw (unrounded) mean to avoid rounding error accumulation in the variance sum
      const rawAverage = getAverage(nonNullNumbers);
      const variance = getAverage(nonNullNumbers.map((value) => (value - rawAverage) ** 2));
      return Math.round(Math.sqrt(variance) * 100) / 100;
    },
    format: formatOptionalColumnValue,
    key: "standardDeviation",
    title: "Standard Deviation",
  }),
  summation: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number],
    compute: ({ nonNullNumbers }) => Math.round(getSummation(nonNullNumbers) * 100) / 100,
    format: formatOptionalColumnValue,
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
    compute: ({ columnType, nonNullNumbers, nonNullStrings }) =>
      columnType === ColumnType.Number ? new Set(nonNullNumbers).size : new Set(nonNullStrings).size,
    format: formatOptional,
    key: "uniqueCount",
    title: "Unique",
  }),
} as const satisfies { [K in ColumnStatisticsKey]: ColumnStatisticsDefinition<K> };

export const ColumnStatisticsDefinitions = Object.values(ColumnStatisticsDefinitionMap);
