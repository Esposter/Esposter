import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { ColumnChartData } from "@/models/resource/sheet/column/ColumnChartData";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

const ColumnChartDataMap: Partial<Record<ColumnType, (statistics: ColumnStatistics) => ColumnChartData | undefined>> = {
  [ColumnType.Boolean]: (columnStatistics) => ({
    options: {
      chart: { toolbar: { show: false } },
      labels: ["True", "False", "Null"],
    },
    series: [columnStatistics.trueCount ?? 0, columnStatistics.falseCount ?? 0, columnStatistics.nullCount],
    type: "pie",
  }),
  [ColumnType.Date]: (columnStatistics) => {
    if (!columnStatistics.topFrequencies?.length) return undefined;
    return {
      options: {
        chart: { toolbar: { show: false } },
        xaxis: { categories: columnStatistics.topFrequencies.map(([month]) => month) },
      },
      series: [
        {
          data: columnStatistics.topFrequencies.map(([, count]) => count),
          name: columnStatistics.columnName,
        },
      ],
      type: "bar",
    };
  },
  [ColumnType.Number]: (columnStatistics) => {
    if (
      columnStatistics.minimum === undefined ||
      columnStatistics.average === undefined ||
      columnStatistics.maximum === undefined
    )
      return undefined;
    return {
      options: {
        chart: { toolbar: { show: false } },
        plotOptions: { bar: { horizontal: true } },
        xaxis: { categories: ["Minimum", "Average", "Maximum"] },
      },
      series: [
        {
          data: [columnStatistics.minimum, columnStatistics.average, columnStatistics.maximum],
          name: columnStatistics.columnName,
        },
      ],
      type: "bar",
    };
  },
  [ColumnType.String]: (columnStatistics) => {
    if (!columnStatistics.topFrequencies?.length) return undefined;
    const entries = [...columnStatistics.topFrequencies].toReversed();
    return {
      options: {
        chart: { toolbar: { show: false } },
        plotOptions: { bar: { horizontal: true } },
        xaxis: { categories: entries.map(([value]) => value) },
      },
      series: [{ data: entries.map(([, count]) => count), name: columnStatistics.columnName }],
      type: "bar",
    };
  },
};

export const ChartableColumnTypes: ReadonlySet<ColumnType> = new Set(Object.keys(ColumnChartDataMap) as ColumnType[]);

export const computeColumnChartData = (columnStatistics: ColumnStatistics): ColumnChartData | undefined => {
  const compute = ColumnChartDataMap[columnStatistics.columnType];
  return compute ? compute(columnStatistics) : undefined;
};
