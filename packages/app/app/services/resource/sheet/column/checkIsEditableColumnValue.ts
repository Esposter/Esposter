import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { EditableColumnValue } from "@/models/resource/sheet/column/EditableColumnValue";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

export const checkIsEditableColumnValue = (column: Column): column is EditableColumnValue =>
  column.type !== ColumnType.Computed;
