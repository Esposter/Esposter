import type { Column } from "#shared/models/resource/file/column/Column";
import type { EditableColumnValue } from "#shared/models/resource/file/column/EditableColumnValue";

import { ColumnType } from "#shared/models/resource/file/column/ColumnType";

export const checkIsEditableColumnValue = (column: Column): column is EditableColumnValue =>
  column.type !== ColumnType.Computed;
