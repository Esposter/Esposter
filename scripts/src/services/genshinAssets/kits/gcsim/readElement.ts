import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

// An element of a constant's list at an index, where the constant is a list
export const readElement = (value: GoValue | undefined, index: number): GoValue | undefined =>
  Array.isArray(value) ? value[index] : undefined;
