import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";
import type { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexOptions } from "apexcharts";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export interface ColumnChartData {
  options: ApexOptions;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  type: NonNullable<ApexOptions["chart"]>["type"];
}

const ColumnChartDataMap: Partial<Record<ColumnType, (stats: ColumnStats) => ColumnChartData | null>> = {
  [ColumnType.Boolean]: (columnStats) => ({
    options: {
      chart: { toolbar: { show: false } },
      labels: ["True", "False", "Null"],
    },
    series: [columnStats.trueCount ?? 0, columnStats.falseCount ?? 0, columnStats.nullCount],
    type: "pie",
  }),
  [ColumnType.Number]: (columnStats) => {
    if (columnStats.minimum === null || columnStats.average === null || columnStats.maximum === null) return null;
    return {
      options: {
        chart: { toolbar: { show: false } },
        plotOptions: { bar: { horizontal: true } },
        xaxis: { categories: ["Minimum", "Average", "Maximum"] },
      },
      series: [{ data: [columnStats.minimum, columnStats.average, columnStats.maximum], name: columnStats.columnName }],
      type: "bar",
    };
  },
};

export const computeColumnChartData = (columnStats: ColumnStats): ColumnChartData | null => {
  const compute = ColumnChartDataMap[columnStats.columnType];
  return compute ? compute(columnStats) : null;
};
