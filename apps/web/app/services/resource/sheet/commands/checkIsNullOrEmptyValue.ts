import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

// eslint-disable-next-line no-restricted-syntax -- a cell keeps the text typed in it, as a spreadsheet does
export const checkIsNullOrEmptyValue = (value: ColumnValue) => value === null || value === "";
