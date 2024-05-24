import type { VueApexChartsComponent } from "vue3-apexcharts";

export interface DashboardVisualData {
  series: VueApexChartsComponent["series"];
  options?: VueApexChartsComponent["options"];
}
