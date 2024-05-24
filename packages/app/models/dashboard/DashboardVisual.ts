import type { ChartType } from "@/models/dashboard/ChartType";
import type { LayoutItem } from "grid-layout-plus";

export interface DashboardVisual extends LayoutItem {
  type: ChartType;
}
