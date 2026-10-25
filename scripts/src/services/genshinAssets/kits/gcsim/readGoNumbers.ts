import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";

// Every number a value holds, a list of levels' hitmarks flattened into one list
export const readGoNumbers = (value: GoValue): number[] => {
  if (Array.isArray(value)) return value.flatMap((element) => readGoNumbers(element));
  const number = readGoNumber(value);
  return number === undefined ? [] : [number];
};
