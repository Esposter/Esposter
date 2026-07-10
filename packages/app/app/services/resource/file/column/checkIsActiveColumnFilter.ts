import type { ColumnFilter } from "@/models/resource/file/column/ColumnFilter";

import { ColumnType } from "#shared/models/resource/file/column/ColumnType";

export const checkIsActiveColumnFilter = (filter: ColumnFilter): boolean => {
  if (filter.type === ColumnType.Number) return filter.minimum !== "" || filter.maximum !== "";
  return filter.value !== "";
};
