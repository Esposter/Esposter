import { ID_SEPARATOR } from "@esposter/shared";

export const getItemId = (rowId: string, columnName: string) => `${rowId}${ID_SEPARATOR}${columnName}`;
