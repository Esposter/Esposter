import type { WithApplicableColumnTypes } from "#shared/models/tableEditor/file/column/transformation/WithApplicableColumnTypes";
import type { ColumnStatComputeContext } from "@/models/tableEditor/file/column/ColumnStatComputeContext";
import type { ColumnStatKey } from "@/models/tableEditor/file/column/ColumnStatKey";
import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";

export interface ColumnStatDefinition<T extends ColumnStatKey = ColumnStatKey> extends WithApplicableColumnTypes {
  compute: (context: ColumnStatComputeContext) => ColumnStats[T];
  format: (value: ColumnStats[T]) => string;
  key: T;
  sortable?: false;
  title: string;
}
