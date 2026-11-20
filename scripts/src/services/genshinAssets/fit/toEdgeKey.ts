import { ID_SEPARATOR } from "@esposter/shared";

export const toEdgeKey = (first: number, second: number): string =>
  first < second ? `${first}${ID_SEPARATOR}${second}` : `${second}${ID_SEPARATOR}${first}`;
