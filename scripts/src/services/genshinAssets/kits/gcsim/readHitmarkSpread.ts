import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";

import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";

// The hitmark a constant gives a hit, when its value is a number
export const readHitmarkSpread = (constant: GoConstant | undefined) => {
  const value = readGoNumber(constant?.value);
  return constant === undefined || value === undefined
    ? {}
    : { hitmark: { file: constant.file, line: constant.line, value } };
};
