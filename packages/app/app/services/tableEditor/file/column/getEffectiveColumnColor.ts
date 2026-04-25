import type { Column } from "#shared/models/tableEditor/file/column/Column";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTypeColorMap } from "@/services/tableEditor/file/column/ColumnTypeColorMap";
import { getComputedColumnEffectiveType } from "@/services/tableEditor/file/column/getComputedColumnEffectiveType";

export const getEffectiveColumnColor = (column: Column): string =>
  column.type === ColumnType.Computed
    ? ColumnTypeColorMap[getComputedColumnEffectiveType(column)]
    : ColumnTypeColorMap[column.type];
