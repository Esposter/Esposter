import { AreaPropsData } from "@/assets/dashboard/demo/data/AreaPropsData";
import { BarPropsData } from "@/assets/dashboard/demo/data/BarPropsData";
import { BoxPlotPropsData } from "@/assets/dashboard/demo/data/BoxPlotPropsData";
import { CandlestickPropsData } from "@/assets/dashboard/demo/data/CandlestickPropsData";
import { ColumnPropsData } from "@/assets/dashboard/demo/data/ColumnPropsData";
import { LinePropsData } from "@/assets/dashboard/demo/data/LinePropsData";
import { RangeAreaPropsData } from "@/assets/dashboard/demo/data/RangeAreaPropsData";
import { RangeBarPropsData } from "@/assets/dashboard/demo/data/RangeBarPropsData";
import { FunnelPropsDataMap } from "@/assets/dashboard/demo/data/funnel/FunnelPropsDataMap";
import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";
import { VisualType } from "@/models/dashboard/VisualType";
import type { ChartType } from "@/models/dashboard/chart/ChartType";
import { NotFoundError } from "@esposter/shared";

export const VisualTypeDemoDataMap = {
  [VisualType.Area]: () => AreaPropsData,
  [VisualType.Bar]: () => BarPropsData,
  [VisualType.BoxPlot]: () => BoxPlotPropsData,
  [VisualType.Candlestick]: () => CandlestickPropsData,
  [VisualType.Column]: () => ColumnPropsData,
  [VisualType.Funnel]: (chartType) => {
    if (!(chartType in FunnelPropsDataMap)) throw new NotFoundError("VisualTypeDemoDataMap", chartType);
    return FunnelPropsDataMap[chartType as keyof typeof FunnelPropsDataMap];
  },
  [VisualType.Line]: () => LinePropsData,
  [VisualType.RangeArea]: () => RangeAreaPropsData,
  [VisualType.RangeBar]: () => RangeBarPropsData,
} as const satisfies Record<VisualType, (chartType: ChartType) => VisualPropsData>;
