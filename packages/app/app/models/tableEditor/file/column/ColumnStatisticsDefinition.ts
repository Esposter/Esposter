import type { ApplicableColumnTypes } from "#shared/models/tableEditor/file/column/transformation/ApplicableColumnTypes";
import type { ColumnStatistics } from "@/models/tableEditor/file/column/ColumnStatistics";
import type { ColumnStatisticsComputeContext } from "@/models/tableEditor/file/column/ColumnStatisticsComputeContext";
import type { ColumnStatisticsKey } from "@/models/tableEditor/file/column/ColumnStatisticsKey";

export interface ColumnStatisticsDefinition<T extends ColumnStatisticsKey = ColumnStatisticsKey>
  extends ApplicableColumnTypes {
  compute: (context: ColumnStatisticsComputeContext) => ColumnStatistics[T];
  format: (value: ColumnStatistics[T]) => string;
  key: T;
  sortable?: false;
  title: string;
}
