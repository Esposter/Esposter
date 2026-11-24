import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

// oxlint-disable-next-line selector-ban/no-restricted-syntax -- a cell keeps text typed in it, as a spreadsheet does
export const checkIsNullOrEmptyValue = (value: ColumnValue) => value === null || value === "";
