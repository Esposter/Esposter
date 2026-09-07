import { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import { VisualType } from "#shared/models/dashboard/data/VisualType";

const CommonChartTypes: ChartType[] = [ChartType.Basic];

export const VisualTypeChartTypesMap = {
  [VisualType.Area]: CommonChartTypes,
  [VisualType.Bar]: CommonChartTypes,
  [VisualType.BoxPlot]: CommonChartTypes,
  [VisualType.Bubble]: [...CommonChartTypes, ChartType["3D"]],
  [VisualType.Candlestick]: CommonChartTypes,
  [VisualType.Column]: CommonChartTypes,
  [VisualType.Funnel]: [...CommonChartTypes, ChartType.Pyramid],
  [VisualType.Heatmap]: CommonChartTypes,
  [VisualType.Line]: CommonChartTypes,
  [VisualType.Pie]: [...CommonChartTypes, ChartType.Donut],
  [VisualType.PolarArea]: CommonChartTypes,
  [VisualType.Radar]: CommonChartTypes,
  [VisualType.RadialBar]: CommonChartTypes,
  [VisualType.RangeArea]: CommonChartTypes,
  [VisualType.RangeBar]: CommonChartTypes,
  [VisualType.Scatter]: CommonChartTypes,
  [VisualType.Slope]: CommonChartTypes,
  [VisualType.Treemap]: [...CommonChartTypes, ChartType.Distributed],
} as const satisfies Record<VisualType, ChartType[]>;
