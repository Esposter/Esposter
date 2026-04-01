import type { ColumnStatistics } from "@/models/tableEditor/file/column/ColumnStatistics";
import type { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexOptions } from "apexcharts";

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
};

export const computeColumnChartData = (columnStatistics: ColumnStatistics): ColumnChartData | null => {
  const compute = ColumnChartDataMap[columnStatistics.columnType];
  return compute ? compute(columnStatistics) : null;
};
