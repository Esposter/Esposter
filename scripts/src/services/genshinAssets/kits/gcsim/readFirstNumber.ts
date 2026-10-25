import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";

// The first number of a constant, descending through each level's first element where it is a list of states
export const readFirstNumber = (value: GoValue | undefined): number | undefined =>
  Array.isArray(value) ? readFirstNumber(value[0]) : readGoNumber(value);
