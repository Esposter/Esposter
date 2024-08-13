import type { VueApexChartsComponent } from "vue3-apexcharts";

export interface VisualPropsData {
  options?: VueApexChartsComponent["options"];
  series: VueApexChartsComponent["series"];
}
