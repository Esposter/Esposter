import type { Column } from "#shared/models/tableEditor/file/Column";
import type { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";

export interface ColumnTypeColumnMap {
  [ColumnType.Boolean]: Column<ColumnType.Boolean>;
  [ColumnType.Date]: DateColumn;
  [ColumnType.Number]: Column<ColumnType.Number>;
  [ColumnType.String]: Column;
}
