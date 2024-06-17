import type { VueApexChartsComponent } from "vue3-apexcharts";

export interface VisualPropsData {
  series: VueApexChartsComponent["series"];
  options?: VueApexChartsComponent["options"];
}
