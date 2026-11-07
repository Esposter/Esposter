import { VisualType } from "#shared/models/dashboard/data/VisualType";

// A card and a table draw their own values rather than a chart, so a chart's type and settings mean nothing for them
export const checkIsChartVisualType = (type: VisualType): boolean =>
  type !== VisualType.Card && type !== VisualType.Table;
