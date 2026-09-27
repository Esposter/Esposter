import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { VisualDatasetShape } from "@/models/dashboard/VisualDatasetShape";

export const VisualTypeDatasetShapeMap = {
  [VisualType.Area]: VisualDatasetShape.Categories,
  [VisualType.Bar]: VisualDatasetShape.Categories,
  [VisualType.BoxPlot]: VisualDatasetShape.None,
  [VisualType.Bubble]: VisualDatasetShape.None,
  [VisualType.Candlestick]: VisualDatasetShape.None,
  [VisualType.Column]: VisualDatasetShape.Categories,
  [VisualType.Funnel]: VisualDatasetShape.Categories,
  [VisualType.Heatmap]: VisualDatasetShape.Categories,
  [VisualType.Line]: VisualDatasetShape.Categories,
  [VisualType.Pie]: VisualDatasetShape.Labels,
  [VisualType.PolarArea]: VisualDatasetShape.Labels,
  [VisualType.Radar]: VisualDatasetShape.Categories,
  [VisualType.RadialBar]: VisualDatasetShape.Labels,
  [VisualType.RangeArea]: VisualDatasetShape.None,
  [VisualType.RangeBar]: VisualDatasetShape.None,
  [VisualType.Scatter]: VisualDatasetShape.Categories,
  [VisualType.Slope]: VisualDatasetShape.Points,
  [VisualType.Treemap]: VisualDatasetShape.Points,
} as const satisfies Record<VisualType, VisualDatasetShape>;
