import type { ColumnStatistics } from "@/models/tableEditor/file/column/ColumnStatistics";
import type { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexOptions } from "apexcharts";

import { dayjs } from "#shared/services/dayjs";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export interface ColumnChartData {
  options: ApexOptions;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  type: NonNullable<ApexOptions["chart"]>["type"];
}

const ColumnChartDataMap: Partial<Record<ColumnType, (statistics: ColumnStatistics) => ColumnChartData | null>> = {
  [ColumnType.Boolean]: (columnStatistics) => ({
    options: {
      chart: { toolbar: { show: false } },
      labels: ["True", "False", "Null"],
    },
    series: [columnStatistics.trueCount ?? 0, columnStatistics.falseCount ?? 0, columnStatistics.nullCount],
    type: "pie",
  }),
  [ColumnType.Date]: (columnStatistics) => {
    if (!columnStatistics.topFrequencies?.length) return null;
    const monthCounts = new Map<string, number>();
    for (const [value, count] of columnStatistics.topFrequencies) {
      const month = dayjs(value).format("YYYY-MM");
      monthCounts.set(month, (monthCounts.get(month) ?? 0) + count);
    }
    const sortedMonths = [...monthCounts.keys()].sort();
    return {
      options: {
        chart: { toolbar: { show: false } },
        xaxis: { categories: sortedMonths },
      },
      series: [{ data: sortedMonths.map((month) => monthCounts.get(month) ?? 0), name: columnStatistics.columnName }],
      type: "bar",
    };
  },
  [ColumnType.Number]: (columnStatistics) => {
    if (columnStatistics.minimum === null || columnStatistics.average === null || columnStatistics.maximum === null)
      return null;
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
    if (!columnStatistics.topFrequencies?.length) return null;
    const entries = [...columnStatistics.topFrequencies].reverse();
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

export const computeColumnChartData = (columnStatistics: ColumnStatistics): ColumnChartData | null => {
  const compute = ColumnChartDataMap[columnStatistics.columnType];
  return compute ? compute(columnStatistics) : null;
};
