import type { Column } from "#shared/models/resource/file/column/Column";
import type { ColumnValue } from "#shared/models/resource/file/column/ColumnValue";

export interface IndexedColumn {
  columnIndex: number;
  originalColumn: Column;
  originalRowValues: ColumnValue[];
}
