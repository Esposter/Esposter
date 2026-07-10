import type { ColumnStatistics } from "#shared/models/resource/file/column/ColumnStatistics";
import type { ColumnStatisticsKey } from "#shared/models/resource/file/column/ColumnStatisticsKey";
import type { ApplicableColumnTypes } from "#shared/models/resource/file/column/transformation/ApplicableColumnTypes";
import type { ColumnStatisticsComputeContext } from "@/models/resource/file/column/ColumnStatisticsComputeContext";

export interface ColumnStatisticsDefinition<
  T extends ColumnStatisticsKey = ColumnStatisticsKey,
> extends ApplicableColumnTypes {
  compute: (context: ColumnStatisticsComputeContext) => ColumnStatistics[T];
  format: (value: ColumnStatistics[T]) => string;
  key: T;
  sortable?: false;
  title: string;
}
