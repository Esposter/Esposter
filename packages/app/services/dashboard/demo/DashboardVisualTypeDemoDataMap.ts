import type { DashboardVisualData } from "@/models/dashboard/DashboardVisualData";
import { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";
import { AreaData } from "@/services/dashboard/demo/data/AreaData";
import { ColumnData } from "@/services/dashboard/demo/data/ColumnData";
import { LineData } from "@/services/dashboard/demo/data/LineData";

export const DashboardVisualTypeDemoDataMap = {
  [DashboardVisualType.Area]: AreaData,
  [DashboardVisualType.Column]: ColumnData,
  [DashboardVisualType.Line]: LineData,
} as const satisfies Record<DashboardVisualType, DashboardVisualData>;
