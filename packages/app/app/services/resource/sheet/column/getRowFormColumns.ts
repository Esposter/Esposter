import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { EditableColumnValue } from "#shared/models/resource/sheet/column/EditableColumnValue";

import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";
import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";

// The fields an add-row or edit-row form renders: the columns the user can currently see, minus the computed
// Ones the form cannot write. It narrows through getVisibleColumns so hiding a column cannot mean one thing to
// The grid and another to the form that writes into it
export const getRowFormColumns = (columns: Column[]): EditableColumnValue[] =>
  getVisibleColumns(columns).filter((column): column is EditableColumnValue => checkIsEditableColumnValue(column));
