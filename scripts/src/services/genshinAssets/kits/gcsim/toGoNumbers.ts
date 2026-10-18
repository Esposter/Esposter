import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";

// The numbers a Go value holds, a number as one and a slice of numbers as itself. Any other value holds none
export const toGoNumbers = (value: GoValue | undefined): number[] | undefined => {
  if (!Array.isArray(value)) {
    const number = readGoNumber(value);
    return number === undefined ? undefined : [number];
  }
  const numbers = value.flatMap((element) => readGoNumber(element) ?? []);
  return numbers.length === value.length ? numbers : undefined;
};
