import type { VueApexChartsComponent } from "vue3-apexcharts";

export interface VisualData {
  type: VueApexChartsComponent["type"];
  series: VueApexChartsComponent["series"];
  options?: VueApexChartsComponent["options"];
}
