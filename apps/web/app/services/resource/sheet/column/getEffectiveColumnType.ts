import type { Column } from "#shared/models/resource/sheet/column/Column";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { getComputedColumnEffectiveType } from "@/services/resource/sheet/column/getComputedColumnEffectiveType";

export const getEffectiveColumnType = (column: Column) =>
  column.type === ColumnType.Computed ? getComputedColumnEffectiveType(column) : column.type;
