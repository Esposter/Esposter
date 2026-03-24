import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

export interface ColumnStatComputeContext {
  column: DataSource["columns"][number];
  nonNullBooleans: boolean[];
  nonNullNumbers: number[];
  nonNullStrings: string[];
  nullCount: number;
  values: (ColumnValue | undefined)[];
}
