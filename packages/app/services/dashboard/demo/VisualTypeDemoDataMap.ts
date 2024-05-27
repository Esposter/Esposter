import type { VisualData } from "@/models/dashboard/VisualData";
import { VisualType } from "@/models/dashboard/VisualType";
import { AreaData } from "@/services/dashboard/demo/data/AreaData";
import { ColumnData } from "@/services/dashboard/demo/data/ColumnData";
import { LineData } from "@/services/dashboard/demo/data/LineData";

export const VisualTypeDemoDataMap = {
  [VisualType.Area]: AreaData,
  [VisualType.Column]: ColumnData,
  [VisualType.Line]: LineData,
} as const satisfies Record<VisualType, VisualData>;
