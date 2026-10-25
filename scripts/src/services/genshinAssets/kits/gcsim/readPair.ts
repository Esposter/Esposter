import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { toGoNumbers } from "#src/services/genshinAssets/kits/gcsim/toGoNumbers";

// A pair of numbers, its two dimensions in order
export const readPair = (value: GoValue | undefined): [number, number] | undefined => {
  const [first, second] = toGoNumbers(value) ?? [];
  return first === undefined || second === undefined ? undefined : [first, second];
};
