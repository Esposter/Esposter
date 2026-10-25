import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { EditableColumnValue } from "#shared/models/resource/sheet/column/EditableColumnValue";
import type { ToData } from "@esposter/shared";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

export const checkIsEditableColumnValue = (column: ToData<Column>): column is EditableColumnValue =>
  column.type !== ColumnType.Computed;
