import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { ColumnStatisticsKey } from "#shared/models/resource/sheet/column/ColumnStatisticsKey";
import type { ApplicableColumnTypes } from "@/models/resource/sheet/column/ApplicableColumnTypes";
import type { ColumnStatisticsComputeContext } from "@/models/resource/sheet/column/ColumnStatisticsComputeContext";

export interface ColumnStatisticsDefinition<
  T extends ColumnStatisticsKey = ColumnStatisticsKey,
> extends ApplicableColumnTypes {
  compute: (context: ColumnStatisticsComputeContext) => ColumnStatistics[T];
  // The column is passed so a statistic in its units can be shown the way its cells are; the ones that are
  // Dimensionless — counts, percentages — simply declare a one-parameter formatter and ignore it
  format: (value: ColumnStatistics[T], column: Column) => string;
  key: T;
  sortable?: false;
  title: string;
}
