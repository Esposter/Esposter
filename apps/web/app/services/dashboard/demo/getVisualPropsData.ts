import type { ChartType } from "#shared/models/dashboard/data/chart/type/ChartType";
import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

import { NotFoundError } from "@esposter/shared";

// The per-type demo maps cover only the chart types their visual offers, so a lookup that misses is a chart
// Type the map was never given an entry for
export const getVisualPropsData = (
  visualPropsDataMap: Partial<Record<ChartType, VisualPropsData>>,
  chartType: ChartType,
): VisualPropsData => {
  const visualPropsData = visualPropsDataMap[chartType];
  if (visualPropsData) return visualPropsData;
  else throw new NotFoundError("VisualTypeDemoDataMap", chartType);
};
