import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ToData } from "@esposter/shared";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { getVisibleColumns } from "#src/services/resource/sheet/column/getVisibleColumns";

// The columns a text command (null strategies, string transformations) can act on — the string ones among what
// The user can currently see
export const getVisibleStringColumns = (columns: ToData<Column>[]) =>
  getVisibleColumns(columns).filter((column) => column.type === ColumnType.String);
