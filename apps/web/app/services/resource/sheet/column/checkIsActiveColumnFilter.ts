import type { ColumnFilter } from "#src/models/resource/sheet/column/ColumnFilter";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

export const checkIsActiveColumnFilter = (filter: ColumnFilter) => {
  // eslint-disable-next-line no-restricted-syntax -- a number filter bound, from a number input that holds no spaces
  if (filter.type === ColumnType.Number) return filter.minimum !== "" || filter.maximum !== "";
  else return Boolean(filter.value);
};
