import type { ColumnStatDefinition } from "@/models/tableEditor/file/column/ColumnStatDefinition";
import type { ColumnStatKey } from "@/models/tableEditor/file/column/ColumnStatKey";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { defineColumnStat } from "@/services/tableEditor/file/column/defineColumnStat";

const formatNullable = (value: null | number | string) => (value === null ? "—" : String(value));

export const ColumnStatDefinitionMap = {
  average: defineColumnStat({
    appliesTo: [ColumnType.Number],
    compute: ({ nonNullNumbers }) => {
      if (nonNullNumbers.length === 0) return null;
      const raw = nonNullNumbers.reduce((s, value) => s + value, 0) / nonNullNumbers.length;
      return Math.round(raw * 100) / 100;
    },
    format: formatNullable,
    key: "average",
    title: "Average",
  }),
  emptyPercent: defineColumnStat({
    appliesTo: [ColumnType.String, ColumnType.Date],
    compute: ({ nullCount, values }) =>
      values.length === 0 ? null : Math.round((nullCount / values.length) * 1000) / 10,
    format: (value) => (value === null ? "—" : `${value}%`),
    key: "emptyPercent",
    title: "Empty %",
  }),
  falseCount: defineColumnStat({
    appliesTo: [ColumnType.Boolean],
    compute: ({ nonNullBooleans }) => nonNullBooleans.filter((value) => !value).length,
    format: formatNullable,
    key: "falseCount",
    title: "False",
  }),
  maximum: defineColumnStat({
    appliesTo: [ColumnType.Number],
    compute: ({ nonNullNumbers }) =>
      nonNullNumbers.length > 0 ? nonNullNumbers.reduce((m, value) => Math.max(m, value), -Infinity) : null,
    format: formatNullable,
    key: "maximum",
    title: "Maximum",
  }),
  minimum: defineColumnStat({
    appliesTo: [ColumnType.Number],
    compute: ({ nonNullNumbers }) =>
      nonNullNumbers.length > 0 ? nonNullNumbers.reduce((m, value) => Math.min(m, value), Infinity) : null,
    format: formatNullable,
    key: "minimum",
    title: "Minimum",
  }),
  mostFrequentValue: defineColumnStat({
    appliesTo: [ColumnType.String, ColumnType.Date],
    compute: ({ nonNullStrings }) => {
      if (nonNullStrings.length === 0) return null;
      const countMap = new Map<string, number>();
      for (const value of nonNullStrings) countMap.set(value, (countMap.get(value) ?? 0) + 1);
      let mostFrequent: null | string = null;
      let maxCount = 0;
      for (const [value, count] of countMap)
        if (count > maxCount) {
          maxCount = count;
          mostFrequent = value;
        }

      return mostFrequent;
    },
    format: formatNullable,
    key: "mostFrequentValue",
    sortable: false,
    title: "Most Frequent",
  }),
  nullCount: defineColumnStat({
    appliesTo: [ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String],
    compute: ({ nullCount }) => nullCount,
    format: (value) => value.toString(),
    key: "nullCount",
    title: "Nulls",
  }),
  standardDeviation: defineColumnStat({
    appliesTo: [ColumnType.Number],
    compute: ({ nonNullNumbers }) => {
      if (nonNullNumbers.length === 0) return null;
      // Use raw (unrounded) mean to avoid rounding error accumulation in the variance sum
      const rawAverage = nonNullNumbers.reduce((s, value) => s + value, 0) / nonNullNumbers.length;
      const variance = nonNullNumbers.reduce((s, value) => s + (value - rawAverage) ** 2, 0) / nonNullNumbers.length;
      return Math.round(Math.sqrt(variance) * 100) / 100;
    },
    format: formatNullable,
    key: "standardDeviation",
    title: "Standard Deviation",
  }),
  trueCount: defineColumnStat({
    appliesTo: [ColumnType.Boolean],
    compute: ({ nonNullBooleans }) => nonNullBooleans.filter(Boolean).length,
    format: formatNullable,
    key: "trueCount",
    title: "True",
  }),
  uniqueCount: defineColumnStat({
    appliesTo: [ColumnType.Number, ColumnType.String, ColumnType.Date],
    compute: ({ column, nonNullNumbers, nonNullStrings }) =>
      column.type === ColumnType.Number ? new Set(nonNullNumbers).size : new Set(nonNullStrings).size,
    format: formatNullable,
    key: "uniqueCount",
    title: "Unique",
  }),
} as const satisfies { [K in ColumnStatKey]: ColumnStatDefinition<K> };
