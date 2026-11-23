import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

// A
// oxlint-disable-next-line selector-ban/no-restricted-syntax -- cell keeps the text typed in it, as a spreadsheet does
export const checkIsNullOrEmptyValue = (value: ColumnValue) => value === null || value === "";
