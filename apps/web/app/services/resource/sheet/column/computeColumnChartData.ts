import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { ColumnChartData } from "@/models/resource/sheet/column/ColumnChartData";

import { ColumnChartDataMap } from "@/services/resource/sheet/column/ColumnChartDataMap";

export const computeColumnChartData = (columnStatistics: ColumnStatistics): ColumnChartData | undefined => {
  const compute = ColumnChartDataMap[columnStatistics.columnType];
  return compute ? compute(columnStatistics) : undefined;
};
