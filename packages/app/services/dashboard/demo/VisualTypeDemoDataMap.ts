import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";
import { VisualType } from "@/models/dashboard/VisualType";
import { AreaPropsData } from "@/services/dashboard/demo/data/AreaPropsData";
import { ColumnPropsData } from "@/services/dashboard/demo/data/ColumnPropsData";
import { LinePropsData } from "@/services/dashboard/demo/data/LinePropsData";

export const VisualTypeDemoDataMap = {
  [VisualType.Area]: AreaPropsData,
  [VisualType.Column]: ColumnPropsData,
  [VisualType.Line]: LinePropsData,
} as const satisfies Record<VisualType, VisualPropsData>;
