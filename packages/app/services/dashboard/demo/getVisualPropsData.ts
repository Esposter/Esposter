import type { ChartType } from "@/shared/models/dashboard/data/chart/type/ChartType";

import { NotFoundError } from "@esposter/shared";

export const getVisualPropsData = <T extends object>(visualPropsDataMap: T, chartType: ChartType) => {
  if (!(chartType in visualPropsDataMap)) throw new NotFoundError("VisualTypeDemoDataMap", chartType);
  return visualPropsDataMap[chartType as keyof typeof visualPropsDataMap];
};
