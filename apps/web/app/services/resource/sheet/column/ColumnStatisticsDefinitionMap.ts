import type { ColumnStatisticsKey } from "#shared/models/resource/sheet/column/ColumnStatisticsKey";
import type { ColumnStatisticsDefinition } from "@/models/resource/sheet/column/ColumnStatisticsDefinition";

import { ColumnStatisticName } from "#shared/models/resource/sheet/column/ColumnStatisticName";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { getAverage } from "#shared/services/resource/sheet/column/getAverage";
import { getSummation } from "#shared/services/resource/sheet/column/getSummation";
import { defineColumnStatistics } from "@/services/resource/sheet/column/defineColumnStatistics";
import { formatOptionalColumnValue } from "@/services/resource/sheet/column/formatOptionalColumnValue";
import { formatOptional } from "@/util/text/formatOptional";

export const ColumnStatisticsDefinitionMap = {
  [ColumnStatisticName.Average]: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number],
    compute: ({ nonNullNumbers }) => {
      if (nonNullNumbers.length === 0) return undefined;
      else return Math.round(getAverage(nonNullNumbers) * 100) / 100;
    },
    format: formatOptionalColumnValue,
    key: ColumnStatisticName.Average,
    title: "Average",
  }),
  [ColumnStatisticName.FalseCount]: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Boolean],
    compute: ({ nonNullBooleans }) => nonNullBooleans.filter((value) => !value).length,
    format: formatOptional,
    key: ColumnStatisticName.FalseCount,
    title: "False",
  }),
  [ColumnStatisticName.Maximum]: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number],
    compute: ({ nonNullNumbers }) =>
      nonNullNumbers.length > 0
        ? nonNullNumbers.reduce((maximum, value) => Math.max(maximum, value), -Infinity)
        : undefined,
    format: formatOptionalColumnValue,
    key: ColumnStatisticName.Maximum,
    title: "Maximum",
  }),
  [ColumnStatisticName.Minimum]: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number],
    compute: ({ nonNullNumbers }) =>
      nonNullNumbers.length > 0
        ? nonNullNumbers.reduce((minimum, value) => Math.min(minimum, value), Infinity)
        : undefined,
    format: formatOptionalColumnValue,
    key: ColumnStatisticName.Minimum,
    title: "Minimum",
  }),
  [ColumnStatisticName.MostFrequentValue]: defineColumnStatistics({
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
    key: ColumnStatisticName.MostFrequentValue,
    sortable: false,
    title: "Most Frequent",
  }),
  [ColumnStatisticName.NullCount]: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String],
    compute: ({ nullCount }) => nullCount,
    format: (value) => value.toString(),
    key: ColumnStatisticName.NullCount,
    title: "Nulls",
  }),
  [ColumnStatisticName.NullPercentage]: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String],
    compute: ({ nullCount, values }) =>
      values.length === 0 ? undefined : Math.round((nullCount / values.length) * 1000) / 10,
    format: (value) => (value === undefined ? formatOptional(value) : `${value}%`),
    key: ColumnStatisticName.NullPercentage,
    title: "Null %",
  }),
  [ColumnStatisticName.StandardDeviation]: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number],
    compute: ({ nonNullNumbers }) => {
      if (nonNullNumbers.length === 0) return undefined;
      // Use raw (unrounded) mean to avoid rounding error accumulation in the variance sum
      const rawAverage = getAverage(nonNullNumbers);
      const variance = getAverage(nonNullNumbers.map((value) => (value - rawAverage) ** 2));
      return Math.round(Math.sqrt(variance) * 100) / 100;
    },
    format: formatOptionalColumnValue,
    key: ColumnStatisticName.StandardDeviation,
    title: "Standard Deviation",
  }),
  [ColumnStatisticName.Summation]: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number],
    compute: ({ nonNullNumbers }) => Math.round(getSummation(nonNullNumbers) * 100) / 100,
    format: formatOptionalColumnValue,
    key: ColumnStatisticName.Summation,
    title: "Sum",
  }),
  [ColumnStatisticName.TrueCount]: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Boolean],
    compute: ({ nonNullBooleans }) => nonNullBooleans.filter(Boolean).length,
    format: formatOptional,
    key: ColumnStatisticName.TrueCount,
    title: "True",
  }),
  [ColumnStatisticName.UniqueCount]: defineColumnStatistics({
    applicableColumnTypes: [ColumnType.Number, ColumnType.String, ColumnType.Date],
    compute: ({ columnType, nonNullNumbers, stringCountMap }) =>
      columnType === ColumnType.Number ? new Set(nonNullNumbers).size : stringCountMap.size,
    format: formatOptional,
    key: ColumnStatisticName.UniqueCount,
    title: "Unique",
  }),
} as const satisfies { [K in ColumnStatisticsKey]: ColumnStatisticsDefinition<K> };

export const ColumnStatisticsDefinitions = Object.values(ColumnStatisticsDefinitionMap);
