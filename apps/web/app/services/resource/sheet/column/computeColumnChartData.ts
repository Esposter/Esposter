import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { ColumnChartData } from "@/models/resource/sheet/column/ColumnChartData";

import { ColumnTypeChartDataComputeMap } from "@/services/resource/sheet/column/ColumnTypeChartDataComputeMap";

export const computeColumnChartData = (columnStatistics: ColumnStatistics): ColumnChartData | undefined => {
  const compute = ColumnTypeChartDataComputeMap[columnStatistics.columnType];
  return compute ? compute(columnStatistics) : undefined;
};
