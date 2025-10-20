import type { VueApexChartsComponentProps } from "vue3-apexcharts";

export interface VisualPropsData {
  options?: VueApexChartsComponentProps["options"];
  series: VueApexChartsComponentProps["series"];
}
