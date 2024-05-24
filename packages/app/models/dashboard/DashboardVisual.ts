import type { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";
import type { LayoutItem } from "grid-layout-plus";

export interface DashboardVisual extends LayoutItem {
  i: string;
  type: DashboardVisualType;
}
