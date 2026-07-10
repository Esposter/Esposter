import type { BooleanFilterValue } from "@/models/resource/file/column/BooleanFilterValue";

import { ColumnType } from "#shared/models/resource/file/column/ColumnType";

export interface BooleanColumnFilter {
  type: ColumnType.Boolean;
  value: BooleanFilterValue;
}
