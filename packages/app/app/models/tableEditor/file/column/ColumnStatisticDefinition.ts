import type { ApplicableColumnTypes } from "#shared/models/tableEditor/file/column/transformation/ApplicableColumnTypes";
import type { ColumnStatisticComputeContext } from "@/models/tableEditor/file/column/ColumnStatisticComputeContext";
import type { ColumnStatisticKey } from "@/models/tableEditor/file/column/ColumnStatisticKey";
import type { ColumnStatistics } from "@/models/tableEditor/file/column/ColumnStatistics";

export interface ColumnStatisticDefinition<T extends ColumnStatisticKey = ColumnStatisticKey>
  extends ApplicableColumnTypes {
  compute: (context: ColumnStatisticComputeContext) => ColumnStatistics[T];
  format: (value: ColumnStatistics[T]) => string;
  key: T;
  sortable?: false;
  title: string;
}
