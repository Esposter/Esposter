import { VisualType } from "@/models/dashboard/VisualType";
import { ChartType } from "@/models/dashboard/chart/ChartType";

const commonChartTypes = [ChartType.Basic];
const commonChartTypesWithDataLabels = commonChartTypes.concat(ChartType.DataLabels);

export const VisualTypeChartTypesMap = {
  [VisualType.Area]: commonChartTypesWithDataLabels,
  [VisualType.Bar]: commonChartTypesWithDataLabels,
  [VisualType.Column]: commonChartTypesWithDataLabels,
  [VisualType.Funnel]: commonChartTypes.concat(ChartType.Pyramid),
  [VisualType.Line]: commonChartTypesWithDataLabels,
  [VisualType.RangeArea]: commonChartTypesWithDataLabels,
  [VisualType.RangeBar]: commonChartTypesWithDataLabels,
} as const satisfies Record<VisualType, ChartType[]>;
