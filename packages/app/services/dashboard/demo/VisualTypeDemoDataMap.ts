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
import { BubblePropsDataMap } from "@/assets/dashboard/demo/data/bubble/BubblePropsDataMap";
import { FunnelPropsDataMap } from "@/assets/dashboard/demo/data/funnel/FunnelPropsDataMap";
import { TreemapPropsDataMap } from "@/assets/dashboard/demo/data/treemap/TreemapPropsDataMap";
import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";
import { VisualType } from "@/models/dashboard/VisualType";
import type { ChartType } from "@/models/dashboard/chart/type/ChartType";
import { getVisualPropsData } from "@/services/dashboard/demo/getVisualPropsData";

export const VisualTypeDemoDataMap: Record<VisualType, (chartType: ChartType) => VisualPropsData> = {
  [VisualType.Area]: () => AreaPropsData,
  [VisualType.Bar]: () => BarPropsData,
  [VisualType.BoxPlot]: () => BoxPlotPropsData,
  [VisualType.Bubble]: (chartType) => getVisualPropsData(BubblePropsDataMap, chartType),
  [VisualType.Candlestick]: () => CandlestickPropsData,
  [VisualType.Column]: () => ColumnPropsData,
  [VisualType.Funnel]: (chartType) => getVisualPropsData(FunnelPropsDataMap, chartType),
  [VisualType.Heatmap]: () => HeatmapPropsData,
  [VisualType.Line]: () => LinePropsData,
  [VisualType.RangeArea]: () => RangeAreaPropsData,
  [VisualType.RangeBar]: () => RangeBarPropsData,
  [VisualType.Scatter]: () => ScatterPropsData,
  [VisualType.Treemap]: (chartType) => getVisualPropsData(TreemapPropsDataMap, chartType),
};
