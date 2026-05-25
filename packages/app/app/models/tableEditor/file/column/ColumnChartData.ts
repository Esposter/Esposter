import type { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexOptions } from "apexcharts";

export interface ColumnChartData {
  options: ApexOptions;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  type: NonNullable<ApexOptions["chart"]>["type"];
}
