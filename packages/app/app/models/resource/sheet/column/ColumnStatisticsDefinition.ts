import type { ApplicableColumnTypes } from "#shared/models/resource/sheet/column/ApplicableColumnTypes";
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { ColumnStatisticsKey } from "#shared/models/resource/sheet/column/ColumnStatisticsKey";
import type { ColumnStatisticsComputeContext } from "@/models/resource/sheet/column/ColumnStatisticsComputeContext";

export interface ColumnStatisticsDefinition<
  T extends ColumnStatisticsKey = ColumnStatisticsKey,
> extends ApplicableColumnTypes {
  compute: (context: ColumnStatisticsComputeContext) => ColumnStatistics[T];
  format: (value: ColumnStatistics[T]) => string;
  key: T;
  sortable?: false;
  title: string;
}
