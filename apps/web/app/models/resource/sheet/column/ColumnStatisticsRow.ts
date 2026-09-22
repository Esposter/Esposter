import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

export interface ColumnStatisticsRow {
  column: Column;
  statistics: ColumnStatistics;
}
