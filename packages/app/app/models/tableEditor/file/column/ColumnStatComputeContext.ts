import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

export interface ColumnStatComputeContext {
  column: DataSource["columns"][number];
  nonNullBooleans: boolean[];
  nonNullNumbers: number[];
  nonNullStrings: string[];
  nullCount: number;
  values: (ColumnValue | undefined)[];
}
