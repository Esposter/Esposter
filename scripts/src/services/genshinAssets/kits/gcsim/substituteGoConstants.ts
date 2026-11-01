import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";

import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";

// A bare name, not the field or method of another name and not called or indexed
const CONSTANT_NAME_REGEX = /(?<![.\w])(?<name>[A-Za-z_]\w*)\b(?!\s*[([.])/gu;

// The text with each package constant that is a number in it replaced by its number, so a size a constructor names, as
// `chevalmarinAoE` is 0.5, reads as the size it is. A name the package does not define as a number is left as it is
export const substituteGoConstants = (text: string, constantMap: ReadonlyMap<string, GoConstant>): string =>
  text.replaceAll(CONSTANT_NAME_REGEX, (match, name: string) => {
    const value = readGoNumber(constantMap.get(name)?.value);
    return value === undefined || !Number.isFinite(value) ? match : value < 0 ? `(${value})` : String(value);
  });
