import { ID_SEPARATOR } from "@/util/id/constants";

export const getGridKey = (rowIndex: number, columnIndex: number) => `${rowIndex}${ID_SEPARATOR}${columnIndex}`;
