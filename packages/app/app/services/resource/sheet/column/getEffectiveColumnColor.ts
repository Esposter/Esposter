import type { Column } from "#shared/models/resource/sheet/column/Column";

import { ColumnTypeColorMap } from "@/services/resource/sheet/column/ColumnTypeColorMap";
import { getEffectiveColumnType } from "@/services/resource/sheet/column/getEffectiveColumnType";

export const getEffectiveColumnColor = (column: Column): string => ColumnTypeColorMap[getEffectiveColumnType(column)];
