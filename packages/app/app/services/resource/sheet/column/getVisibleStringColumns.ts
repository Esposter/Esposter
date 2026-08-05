import type { Column } from "#shared/models/resource/sheet/column/Column";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";

// The columns a text command (null strategies, string transformations) can act on: the string columns the user
// Can currently see, narrowed through getVisibleColumns so a hidden column is hidden from every command alike
export const getVisibleStringColumns = (columns: Column[]): Column[] =>
  getVisibleColumns(columns).filter((column) => column.type === ColumnType.String);
