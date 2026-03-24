import type { BooleanFilterValue } from "@/models/tableEditor/file/column/BooleanFilterValue";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export interface BooleanColumnFilter {
  type: ColumnType.Boolean;
  value: BooleanFilterValue;
}
