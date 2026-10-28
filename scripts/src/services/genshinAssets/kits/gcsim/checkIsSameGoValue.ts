import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { checkIsGoFloat } from "#src/services/genshinAssets/kits/gcsim/checkIsGoFloat";

// Whether two written values are the same, float marker included, so a bare `2` and a whole-valued `2.0` differ.
// Compared by Number, since a whole-valued float is a fresh object on each write
export const checkIsSameGoValue = (value: GoValue | undefined, other: GoValue | undefined): boolean =>
  checkIsGoFloat(value) === checkIsGoFloat(other) &&
  (checkIsGoFloat(value) ? value.float : value) === (checkIsGoFloat(other) ? other.float : other);
