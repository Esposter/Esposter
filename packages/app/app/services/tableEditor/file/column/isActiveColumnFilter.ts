import type { ColumnFilter } from "@/models/tableEditor/file/column/ColumnFilter";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export const isActiveColumnFilter = (filter: ColumnFilter): boolean => {
  if (filter.type === ColumnType.Number) return filter.minimum !== "" || filter.maximum !== "";
  return filter.value !== "";
};
