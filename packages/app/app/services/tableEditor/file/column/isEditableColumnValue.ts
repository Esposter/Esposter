import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { EditableColumnValue } from "#shared/models/tableEditor/file/column/EditableColumnValue";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export const isEditableColumnValue = (column: Column): column is EditableColumnValue =>
  column.type !== ColumnType.Computed;
