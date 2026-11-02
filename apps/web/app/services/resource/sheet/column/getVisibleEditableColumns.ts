import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { EditableColumnValue } from "#shared/models/resource/sheet/column/EditableColumnValue";

import { checkIsEditableColumnValue } from "#shared/services/resource/sheet/column/checkIsEditableColumnValue";
import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";

// The columns the user can see and write: the visible ones minus the computed ones, which store no value of their own.
// A row form renders a field for each, and a null or duplicate check reads the stored value of each
export const getVisibleEditableColumns = (columns: Column[]) =>
  getVisibleColumns(columns).filter((column): column is EditableColumnValue => checkIsEditableColumnValue(column));
