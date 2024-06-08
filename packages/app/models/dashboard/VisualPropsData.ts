import type { VisualType } from "@/models/dashboard/VisualType";
import type { VueApexChartsComponent } from "vue3-apexcharts";

export interface VisualPropsData {
  type: VueApexChartsComponent["type"] | Uncapitalize<VisualType.RangeArea>;
  series: VueApexChartsComponent["series"];
  options?: VueApexChartsComponent["options"];
}
