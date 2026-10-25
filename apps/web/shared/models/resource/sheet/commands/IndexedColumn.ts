import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

export interface IndexedColumn {
  columnIndex: number;
  originalColumn: Column;
  originalRowValues: ColumnValue[];
}
