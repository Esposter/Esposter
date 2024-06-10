import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";
import { VisualType } from "@/models/dashboard/VisualType";
import { AreaPropsData } from "@/services/dashboard/demo/data/AreaPropsData";
import { BarPropsData } from "@/services/dashboard/demo/data/BarPropsData";
import { ColumnPropsData } from "@/services/dashboard/demo/data/ColumnPropsData";
import { FunnelPropsData } from "@/services/dashboard/demo/data/FunnelPropsData";
import { LinePropsData } from "@/services/dashboard/demo/data/LinePropsData";
import { RangeAreaPropsData } from "@/services/dashboard/demo/data/RangeAreaPropsData";
import { RangeBarPropsData } from "@/services/dashboard/demo/data/RangeBarPropsData";

export const VisualTypeDemoDataMap = {
  [VisualType.Area]: AreaPropsData,
  [VisualType.Bar]: BarPropsData,
  [VisualType.Column]: ColumnPropsData,
  [VisualType.Funnel]: FunnelPropsData,
  [VisualType.Line]: LinePropsData,
  [VisualType.RangeArea]: RangeAreaPropsData,
  [VisualType.RangeBar]: RangeBarPropsData,
} as const satisfies Record<VisualType, VisualPropsData>;
