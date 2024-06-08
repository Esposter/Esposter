import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";
import { VisualType } from "@/models/dashboard/VisualType";
import { AreaPropsData } from "@/services/dashboard/demo/data/AreaPropsData";
import { BarPropsData } from "@/services/dashboard/demo/data/BarPropsData";
import { ColumnPropsData } from "@/services/dashboard/demo/data/ColumnPropsData";
import { LinePropsData } from "@/services/dashboard/demo/data/LinePropsData";
import { RangeAreaPropsData } from "@/services/dashboard/demo/data/RangeAreaPropsData";

export const VisualTypeDemoDataMap = {
  [VisualType.Area]: AreaPropsData,
  [VisualType.Bar]: BarPropsData,
  [VisualType.Column]: ColumnPropsData,
  [VisualType.Line]: LinePropsData,
  [VisualType.RangeArea]: RangeAreaPropsData,
} as const satisfies Record<VisualType, VisualPropsData>;
