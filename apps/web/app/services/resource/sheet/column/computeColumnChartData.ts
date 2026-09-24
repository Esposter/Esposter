import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

import { ColumnTypeChartDataComputeMap } from "@/services/resource/sheet/column/ColumnTypeChartDataComputeMap";

export const computeColumnChartData = (columnStatistics: ColumnStatistics) =>
  ColumnTypeChartDataComputeMap[columnStatistics.columnType]?.(columnStatistics);
