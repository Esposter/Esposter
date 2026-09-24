import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

export interface ColumnStatisticsRow {
  column: Column;
  // The column's, which keys the row in a table
  id: string;
  statistics: ColumnStatistics;
}
