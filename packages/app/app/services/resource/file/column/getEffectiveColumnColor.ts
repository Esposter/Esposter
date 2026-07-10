import type { Column } from "#shared/models/resource/file/column/Column";

import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { ColumnTypeColorMap } from "@/services/resource/file/column/ColumnTypeColorMap";
import { getComputedColumnEffectiveType } from "@/services/resource/file/column/getComputedColumnEffectiveType";

export const getEffectiveColumnColor = (column: Column): string =>
  column.type === ColumnType.Computed
    ? ColumnTypeColorMap[getComputedColumnEffectiveType(column)]
    : ColumnTypeColorMap[column.type];
