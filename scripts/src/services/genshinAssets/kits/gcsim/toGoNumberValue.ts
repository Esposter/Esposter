import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

// A number as a Go value: a float whose value is whole keeps its float, and every other number is itself
export const toGoNumberValue = (value: number, isFloat: boolean): GoValue =>
  isFloat && Number.isInteger(value) ? { float: value } : value;
