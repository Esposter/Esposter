import { ID_SEPARATOR } from "@esposter/shared";

export const getGridKey = (rowIndex: number, columnIndex: number) => `${rowIndex}${ID_SEPARATOR}${columnIndex}`;
