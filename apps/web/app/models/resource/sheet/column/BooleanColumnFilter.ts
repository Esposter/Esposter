import type { BooleanFilterValue } from "@/models/resource/sheet/column/BooleanFilterValue";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

export interface BooleanColumnFilter {
  type: ColumnType.Boolean;
  value: BooleanFilterValue;
}
