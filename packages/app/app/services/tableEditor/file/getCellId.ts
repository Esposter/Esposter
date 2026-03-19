import { ID_SEPARATOR } from "@esposter/shared";

export const getCellId = (rowId: string, columnName: string) => `${rowId}${ID_SEPARATOR}${columnName}`;
