import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

export interface IndexedColumn {
  columnIndex: number;
  originalColumn: DataSource["columns"][number];
  originalRowValues: ColumnValue[];
}
