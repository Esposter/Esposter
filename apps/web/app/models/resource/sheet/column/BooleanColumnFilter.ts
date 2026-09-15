import type { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import type { BooleanFilterValue } from "@/models/resource/sheet/column/BooleanFilterValue";

export interface BooleanColumnFilter {
  type: ColumnType.Boolean;
  value: BooleanFilterValue;
}
