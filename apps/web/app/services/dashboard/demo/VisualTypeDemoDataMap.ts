import type { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import type { VisualPropsData } from "#src/models/dashboard/VisualPropsData";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { AreaPropsData } from "#src/assets/dashboard/demo/data/AreaPropsData";
import { BarPropsData } from "#src/assets/dashboard/demo/data/BarPropsData";
import { BoxPlotPropsData } from "#src/assets/dashboard/demo/data/BoxPlotPropsData";
import { BubblePropsDataMap } from "#src/assets/dashboard/demo/data/bubble/BubblePropsDataMap";
import { CandlestickPropsData } from "#src/assets/dashboard/demo/data/CandlestickPropsData";
import { CardPropsData } from "#src/assets/dashboard/demo/data/CardPropsData";
import { ColumnPropsData } from "#src/assets/dashboard/demo/data/ColumnPropsData";
import { FunnelPropsDataMap } from "#src/assets/dashboard/demo/data/funnel/FunnelPropsDataMap";
import { HeatmapPropsData } from "#src/assets/dashboard/demo/data/HeatmapPropsData";
import { LinePropsData } from "#src/assets/dashboard/demo/data/LinePropsData";
import { PiePropsData } from "#src/assets/dashboard/demo/data/PiePropsData";
import { PolarAreaPropsData } from "#src/assets/dashboard/demo/data/PolarAreaPropsData";
import { RadarPropsData } from "#src/assets/dashboard/demo/data/RadarPropsData";
import { RadialBarPropsData } from "#src/assets/dashboard/demo/data/RadialBarPropsData";
import { RangeAreaPropsData } from "#src/assets/dashboard/demo/data/RangeAreaPropsData";
import { RangeBarPropsData } from "#src/assets/dashboard/demo/data/RangeBarPropsData";
import { ScatterPropsData } from "#src/assets/dashboard/demo/data/ScatterPropsData";
import { SlopePropsData } from "#src/assets/dashboard/demo/data/SlopePropsData";
import { TreemapPropsDataMap } from "#src/assets/dashboard/demo/data/treemap/TreemapPropsDataMap";
import { getVisualPropsData } from "#src/services/dashboard/demo/getVisualPropsData";

export const VisualTypeDemoDataMap: Record<VisualType, (chartType: ChartType) => VisualPropsData> = {
  [VisualType.Area]: () => AreaPropsData,
  [VisualType.Bar]: () => BarPropsData,
  [VisualType.BoxPlot]: () => BoxPlotPropsData,
  [VisualType.Bubble]: (chartType) => getVisualPropsData(BubblePropsDataMap, chartType),
  [VisualType.Candlestick]: () => CandlestickPropsData,
  [VisualType.Card]: () => CardPropsData,
  [VisualType.Column]: () => ColumnPropsData,
  [VisualType.Funnel]: (chartType) => getVisualPropsData(FunnelPropsDataMap, chartType),
  // A group draws no data of its own, so its demo has no series
  [VisualType.Group]: () => ({ series: [] }),
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
  // An unbound table shows the bar chart's demo categories and series, which are the rows a table lists
  [VisualType.Table]: () => BarPropsData,
  [VisualType.Treemap]: (chartType) => getVisualPropsData(TreemapPropsDataMap, chartType),
};
