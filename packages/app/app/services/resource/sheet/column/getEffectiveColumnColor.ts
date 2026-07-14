import type { Column } from "#shared/models/resource/sheet/column/Column";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ColumnTypeColorMap } from "@/services/resource/sheet/column/ColumnTypeColorMap";
import { getComputedColumnEffectiveType } from "@/services/resource/sheet/column/getComputedColumnEffectiveType";

export const getEffectiveColumnColor = (column: Column): string =>
  column.type === ColumnType.Computed
    ? ColumnTypeColorMap[getComputedColumnEffectiveType(column)]
    : ColumnTypeColorMap[column.type];
