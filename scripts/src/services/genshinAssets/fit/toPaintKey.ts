export const toPaintKey = (part: string, materials: readonly string[]): string =>
  `${part}|${[...new Set(materials)].toSorted().join(",")}`;
