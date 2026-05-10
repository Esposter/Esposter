import { ID_SEPARATOR } from "@esposter/shared";

export const toColumnKey = (name: string) => `${ID_SEPARATOR}${name}`;
