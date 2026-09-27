import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ToData } from "@esposter/shared";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { getComputedColumnEffectiveType } from "#shared/services/resource/sheet/column/getComputedColumnEffectiveType";

export const getEffectiveColumnType = (column: ToData<Column>) =>
  column.type === ColumnType.Computed ? getComputedColumnEffectiveType(column) : column.type;
