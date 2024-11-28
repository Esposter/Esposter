import type { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { AreaPropsData } from "@/assets/dashboard/demo/data/AreaPropsData";
import { BarPropsData } from "@/assets/dashboard/demo/data/BarPropsData";
import { BoxPlotPropsData } from "@/assets/dashboard/demo/data/BoxPlotPropsData";
import { BubblePropsDataMap } from "@/assets/dashboard/demo/data/bubble/BubblePropsDataMap";
import { CandlestickPropsData } from "@/assets/dashboard/demo/data/CandlestickPropsData";
import { ColumnPropsData } from "@/assets/dashboard/demo/data/ColumnPropsData";
import { FunnelPropsDataMap } from "@/assets/dashboard/demo/data/funnel/FunnelPropsDataMap";
import { HeatmapPropsData } from "@/assets/dashboard/demo/data/HeatmapPropsData";
import { LinePropsData } from "@/assets/dashboard/demo/data/LinePropsData";
import { PiePropsData } from "@/assets/dashboard/demo/data/PiePropsData";
import { PolarAreaPropsData } from "@/assets/dashboard/demo/data/PolarAreaPropsData";
import { RadarPropsData } from "@/assets/dashboard/demo/data/RadarPropsData";
import { RadialBarPropsData } from "@/assets/dashboard/demo/data/RadialBarPropsData";
import { RangeAreaPropsData } from "@/assets/dashboard/demo/data/RangeAreaPropsData";
import { RangeBarPropsData } from "@/assets/dashboard/demo/data/RangeBarPropsData";
import { ScatterPropsData } from "@/assets/dashboard/demo/data/ScatterPropsData";
import { SlopePropsData } from "@/assets/dashboard/demo/data/SlopePropsData";
import { TreemapPropsDataMap } from "@/assets/dashboard/demo/data/treemap/TreemapPropsDataMap";
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
  [VisualType.Pie]: () => PiePropsData,
  [VisualType.PolarArea]: () => PolarAreaPropsData,
  [VisualType.Radar]: () => RadarPropsData,
  [VisualType.RadialBar]: () => RadialBarPropsData,
  [VisualType.RangeArea]: () => RangeAreaPropsData,
  [VisualType.RangeBar]: () => RangeBarPropsData,
  [VisualType.Scatter]: () => ScatterPropsData,
  [VisualType.Slope]: () => SlopePropsData,
  [VisualType.Treemap]: (chartType) => getVisualPropsData(TreemapPropsDataMap, chartType),
};
