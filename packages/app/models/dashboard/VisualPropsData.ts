import type { VisualType } from "@/models/dashboard/VisualType";
import type { VueApexChartsComponent } from "vue3-apexcharts";

export interface VisualPropsData {
  type: VueApexChartsComponent["type"] | Uncapitalize<VisualType.BoxPlot | VisualType.RangeArea | VisualType.Treemap>;
  series: VueApexChartsComponent["series"];
  options?: VueApexChartsComponent["options"];
}
