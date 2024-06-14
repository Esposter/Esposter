import { VisualType } from "@/models/dashboard/VisualType";
import { ChartType } from "@/models/dashboard/chart/type/ChartType";

const commonChartTypes: ChartType[] = [ChartType.Basic];
const commonChartTypesWithDataLabels = commonChartTypes.concat(ChartType.DataLabels);

export const VisualTypeChartTypesMap = {
  [VisualType.Area]: commonChartTypesWithDataLabels,
  [VisualType.Bar]: commonChartTypesWithDataLabels,
  [VisualType.BoxPlot]: commonChartTypesWithDataLabels,
  [VisualType.Bubble]: commonChartTypes.concat(ChartType["3D"]),
  [VisualType.Candlestick]: commonChartTypesWithDataLabels,
  [VisualType.Column]: commonChartTypesWithDataLabels,
  [VisualType.Funnel]: commonChartTypes.concat(ChartType.Pyramid),
  [VisualType.Heatmap]: commonChartTypesWithDataLabels,
  [VisualType.Line]: commonChartTypesWithDataLabels,
  [VisualType.RangeArea]: commonChartTypesWithDataLabels,
  [VisualType.RangeBar]: commonChartTypesWithDataLabels,
  [VisualType.Scatter]: commonChartTypesWithDataLabels,
  [VisualType.Treemap]: commonChartTypesWithDataLabels.concat(ChartType.Distributed),
} as const satisfies Record<VisualType, ChartType[]>;
