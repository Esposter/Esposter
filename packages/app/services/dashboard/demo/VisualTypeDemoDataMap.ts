import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";
import { VisualType } from "@/models/dashboard/VisualType";
import type { ChartType } from "@/models/dashboard/chart/ChartType";
import { AreaPropsData } from "@/services/dashboard/demo/data/AreaPropsData";
import { BarPropsData } from "@/services/dashboard/demo/data/BarPropsData";
import { ColumnPropsData } from "@/services/dashboard/demo/data/ColumnPropsData";
import { LinePropsData } from "@/services/dashboard/demo/data/LinePropsData";
import { RangeAreaPropsData } from "@/services/dashboard/demo/data/RangeAreaPropsData";
import { RangeBarPropsData } from "@/services/dashboard/demo/data/RangeBarPropsData";
import { FunnelPropsDataMap } from "@/services/dashboard/demo/data/funnel/FunnelPropsDataMap";
import { NotFoundError } from "@esposter/shared";

export const VisualTypeDemoDataMap = {
  [VisualType.Area]: () => AreaPropsData,
  [VisualType.Bar]: () => BarPropsData,
  [VisualType.Column]: () => ColumnPropsData,
  [VisualType.Funnel]: (chartType) => {
    if (!(chartType in FunnelPropsDataMap)) throw new NotFoundError("VisualTypeDemoDataMap", chartType);
    return FunnelPropsDataMap[chartType as keyof typeof FunnelPropsDataMap];
  },
  [VisualType.Line]: () => LinePropsData,
  [VisualType.RangeArea]: () => RangeAreaPropsData,
  [VisualType.RangeBar]: () => RangeBarPropsData,
} as const satisfies Record<VisualType, (chartType: ChartType) => VisualPropsData>;
