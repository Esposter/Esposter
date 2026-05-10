import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

export interface IndexedColumn {
  columnIndex: number;
  originalColumn: Column;
  originalRowValues: ColumnValue[];
}
