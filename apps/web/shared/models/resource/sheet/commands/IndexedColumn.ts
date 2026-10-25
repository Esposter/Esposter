import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { ToData } from "@esposter/shared";

export interface IndexedColumn {
  columnIndex: number;
  originalColumn: ToData<Column>;
  originalRowValues: ColumnValue[];
}
