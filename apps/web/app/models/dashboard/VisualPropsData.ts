import type { ApexOptions } from "apexcharts";

export interface VisualPropsData {
  options?: ApexOptions;
  series: NonNullable<ApexOptions["series"]>;
}
