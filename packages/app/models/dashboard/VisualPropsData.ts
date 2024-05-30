import type { VueApexChartsComponent } from "vue3-apexcharts";

export interface VisualPropsData {
  type: VueApexChartsComponent["type"];
  series: VueApexChartsComponent["series"];
  options?: VueApexChartsComponent["options"];
}
