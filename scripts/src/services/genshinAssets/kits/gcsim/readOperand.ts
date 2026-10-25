import type { GoOperand } from "#src/models/genshinAssets/kits/gcsim/GoOperand";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { checkIsGoFloat } from "#src/services/genshinAssets/kits/gcsim/checkIsGoFloat";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";

export const readOperand = (value: GoValue | undefined): GoOperand | undefined => {
  const number = readGoNumber(value);
  return number === undefined
    ? undefined
    : { isFloat: checkIsGoFloat(value) || !Number.isInteger(number), value: number };
};
