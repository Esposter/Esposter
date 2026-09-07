import type { ColumnFilter } from "@/models/resource/sheet/column/ColumnFilter";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

export const checkIsActiveColumnFilter = (filter: ColumnFilter): boolean => {
  if (filter.type === ColumnType.Number) return filter.minimum !== "" || filter.maximum !== "";
  return Boolean(filter.value);
};
