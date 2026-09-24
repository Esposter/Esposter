import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

export const checkIsNullOrEmptyValue = (value: ColumnValue) => value === null || value === "";
