import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GCSIM_SKILL_HOLD_PREFIXES } from "#src/services/genshinAssets/kits/constants";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";

// Every number a value holds, a list of levels' hitmarks flattened into one list
const readGoNumbers = (value: GoValue): number[] => {
  if (Array.isArray(value)) return value.flatMap(readGoNumbers);
  const number = readGoNumber(value);
  return number === undefined ? [] : [number];
};

// The hitmarks the skill's holds fire at, each with the file its constant is in. A queue call firing at one of them is
// The hold's hit, so it is no hit of the ability that fires it, as the press's queue calls are not the hold's
export const readGcsimHoldHitmarks = ({
  constantMap,
}: Pick<GcsimCharacter, "constantMap">): { delay: number; file: string }[] =>
  GCSIM_SKILL_HOLD_PREFIXES.flatMap((prefix) => {
    const constant = findGcsimConstant(constantMap, `${prefix}Hitmarks`, `${prefix}Hitmark`);
    return constant === undefined ? [] : readGoNumbers(constant.value).map((delay) => ({ delay, file: constant.file }));
  });
