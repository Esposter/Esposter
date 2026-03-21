import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

export interface IndexedColumn {
  columnIndex: number;
  originalColumn: DataSource["columns"][number];
  originalRowValues: ColumnValue[];
}
