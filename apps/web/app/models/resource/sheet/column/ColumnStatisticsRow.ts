import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { ToData } from "@esposter/shared";

export interface ColumnStatisticsRow {
  column: ToData<Column>;
  // The column's, which keys the row in a table
  id: string;
  statistics: ColumnStatistics;
}
