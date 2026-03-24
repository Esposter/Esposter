import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";
import type { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexOptions } from "apexcharts";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export interface ColumnChartData {
  options: ApexOptions;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  type: NonNullable<ApexOptions["chart"]>["type"];
}

export const computeColumnChartData = (columnStats: ColumnStats): ColumnChartData | null => {
  if (columnStats.columnType === ColumnType.Number) {
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
  }

  if (columnStats.columnType === ColumnType.Boolean)
    return {
      options: {
        chart: { toolbar: { show: false } },
        labels: ["True", "False", "Null"],
      },
      series: [columnStats.trueCount ?? 0, columnStats.falseCount ?? 0, columnStats.nullCount],
      type: "pie",
    };
  return null;
};
