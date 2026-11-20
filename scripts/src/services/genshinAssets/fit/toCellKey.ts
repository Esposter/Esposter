import { ID_SEPARATOR } from "@esposter/shared";

export const toCellKey = (x: number, y: number, z: number): string => `${x}${ID_SEPARATOR}${y}${ID_SEPARATOR}${z}`;
