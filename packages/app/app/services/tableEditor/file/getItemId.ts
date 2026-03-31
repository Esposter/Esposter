import { ID_SEPARATOR } from "@esposter/shared";

// ID_SEPARATOR ("|") is load-bearing: row IDs are UUIDs and column names must not contain "|".
export const getItemId = (rowId: string, columnName: string) => `${rowId}${ID_SEPARATOR}${columnName}`;
