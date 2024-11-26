import { ChartType } from "@/shared/models/dashboard/data/chart/type/ChartType";
import { VisualType } from "@/shared/models/dashboard/data/VisualType";

const commonChartTypes: ChartType[] = [ChartType.Basic];

export const VisualTypeChartTypesMap = {
  [VisualType.Area]: commonChartTypes,
  [VisualType.Bar]: commonChartTypes,
  [VisualType.BoxPlot]: commonChartTypes,
  [VisualType.Bubble]: commonChartTypes.concat(ChartType["3D"]),
  [VisualType.Candlestick]: commonChartTypes,
  [VisualType.Column]: commonChartTypes,
  [VisualType.Funnel]: commonChartTypes.concat(ChartType.Pyramid),
  [VisualType.Heatmap]: commonChartTypes,
  [VisualType.Line]: commonChartTypes,
  [VisualType.Pie]: commonChartTypes.concat(ChartType.Donut),
  [VisualType.PolarArea]: commonChartTypes,
  [VisualType.Radar]: commonChartTypes,
  [VisualType.RadialBar]: commonChartTypes,
  [VisualType.RangeArea]: commonChartTypes,
  [VisualType.RangeBar]: commonChartTypes,
  [VisualType.Scatter]: commonChartTypes,
  [VisualType.Slope]: commonChartTypes,
  [VisualType.Treemap]: commonChartTypes.concat(ChartType.Distributed),
} as const satisfies Record<VisualType, ChartType[]>;
