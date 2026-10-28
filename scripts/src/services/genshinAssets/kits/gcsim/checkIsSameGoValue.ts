import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { checkIsGoFloat } from "#src/services/genshinAssets/kits/gcsim/checkIsGoFloat";

// Whether two written values are the same. A whole-valued float is a fresh object on each write, so it is compared by its
// Number, as a bare number is
export const checkIsSameGoValue = (value: GoValue | undefined, other: GoValue | undefined): boolean =>
  (checkIsGoFloat(value) ? value.float : value) === (checkIsGoFloat(other) ? other.float : other);
