import { AreaPropsData } from "@/assets/dashboard/demo/data/AreaPropsData";
import { BarPropsData } from "@/assets/dashboard/demo/data/BarPropsData";
import { BoxPlotPropsData } from "@/assets/dashboard/demo/data/BoxPlotPropsData";
import { CandlestickPropsData } from "@/assets/dashboard/demo/data/CandlestickPropsData";
import { ColumnPropsData } from "@/assets/dashboard/demo/data/ColumnPropsData";
import { HeatmapPropsData } from "@/assets/dashboard/demo/data/HeatmapPropsData";
import { LinePropsData } from "@/assets/dashboard/demo/data/LinePropsData";
import { RangeAreaPropsData } from "@/assets/dashboard/demo/data/RangeAreaPropsData";
import { RangeBarPropsData } from "@/assets/dashboard/demo/data/RangeBarPropsData";
import { ScatterPropsData } from "@/assets/dashboard/demo/data/ScatterPropsData";
import { TreemapPropsData } from "@/assets/dashboard/demo/data/TreemapPropsData";
import { BubblePropsDataMap } from "@/assets/dashboard/demo/data/bubble/BubblePropsDataMap";
import { FunnelPropsDataMap } from "@/assets/dashboard/demo/data/funnel/FunnelPropsDataMap";
import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";
import { VisualType } from "@/models/dashboard/VisualType";
import type { ChartType } from "@/models/dashboard/chart/ChartType";
import { NotFoundError } from "@esposter/shared";

export const VisualTypeDemoDataMap = {
  [VisualType.Area]: () => AreaPropsData,
  [VisualType.Bar]: () => BarPropsData,
  [VisualType.BoxPlot]: () => BoxPlotPropsData,
  [VisualType.Bubble]: (chartType) => {
    if (!(chartType in BubblePropsDataMap)) throw new NotFoundError("VisualTypeDemoDataMap", chartType);
    return BubblePropsDataMap[chartType as keyof typeof BubblePropsDataMap];
  },
  [VisualType.Candlestick]: () => CandlestickPropsData,
  [VisualType.Column]: () => ColumnPropsData,
  [VisualType.Funnel]: (chartType) => {
    if (!(chartType in FunnelPropsDataMap)) throw new NotFoundError("VisualTypeDemoDataMap", chartType);
    return FunnelPropsDataMap[chartType as keyof typeof FunnelPropsDataMap];
  },
  [VisualType.Heatmap]: () => HeatmapPropsData,
  [VisualType.Line]: () => LinePropsData,
  [VisualType.RangeArea]: () => RangeAreaPropsData,
  [VisualType.RangeBar]: () => RangeBarPropsData,
  [VisualType.Scatter]: () => ScatterPropsData,
  [VisualType.Treemap]: () => TreemapPropsData,
} as const satisfies Record<VisualType, (chartType: ChartType) => VisualPropsData>;
