import type { ApplicableColumnTypes } from "#shared/models/tableEditor/file/column/transformation/ApplicableColumnTypes";
import type { ColumnStatComputeContext } from "@/models/tableEditor/file/column/ColumnStatComputeContext";
import type { ColumnStatKey } from "@/models/tableEditor/file/column/ColumnStatKey";
import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";

export interface ColumnStatDefinition<T extends ColumnStatKey = ColumnStatKey> extends ApplicableColumnTypes {
  compute: (context: ColumnStatComputeContext) => ColumnStats[T];
  format: (value: ColumnStats[T]) => string;
  key: T;
  sortable?: false;
  title: string;
}
