import { ID_SEPARATOR } from "@esposter/shared";

export const toPaintKey = (part: string, materials: readonly string[]): string =>
  `${part}${ID_SEPARATOR}${[...new Set(materials)].toSorted().join(",")}`;
