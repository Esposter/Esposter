import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { checkIsGoFloat } from "#src/services/genshinAssets/kits/gcsim/checkIsGoFloat";

// The number a value holds, a number as itself and a whole-valued float as its number, or none for any other value
export const readGoNumber = (value: GoValue | undefined): number | undefined =>
  typeof value === "number" ? value : checkIsGoFloat(value) ? value.float : undefined;
