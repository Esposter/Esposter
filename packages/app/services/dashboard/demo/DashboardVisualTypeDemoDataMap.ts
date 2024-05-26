import type { DashboardVisualData } from "@/models/dashboard/DashboardVisualData";
import { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";
import { AreaData } from "@/services/dashboard/demo/data/AreaData";
import { LineData } from "@/services/dashboard/demo/data/LineData";

export const DashboardVisualTypeDemoDataMap = {
  [DashboardVisualType.Area]: AreaData,
  [DashboardVisualType.Line]: LineData,
} as const satisfies Record<DashboardVisualType, DashboardVisualData>;
