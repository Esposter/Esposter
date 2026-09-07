import { ID_SEPARATOR } from "@esposter/shared";
// A column name must never contain the separator, or two cells can share one id
export const getItemId = (rowId: string, columnName: string) => `${rowId}${ID_SEPARATOR}${columnName}`;
