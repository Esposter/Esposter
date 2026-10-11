import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

// The numbers a Go value holds, a number as one and a slice of numbers as itself. Any other value holds none
export const toGoNumbers = (value: GoValue | undefined): number[] | undefined => {
  if (typeof value === "number") return [value];
  else return Array.isArray(value) && value.every((element) => typeof element === "number") ? value : undefined;
};
