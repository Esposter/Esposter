import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

export interface ColumnStatisticComputeContext {
  column: Column;
  nonNullBooleans: boolean[];
  nonNullNumbers: number[];
  nonNullStrings: string[];
  nullCount: number;
  values: (ColumnValue | undefined)[];
}
