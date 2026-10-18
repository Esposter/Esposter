import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";

const BAG_PATH_REGEX = /^(?:frames|parameters)\.(?<name>[^.]+)$/u;

// The first number of a constant, descending through each level's first element where it is a list of states
const readFirstNumber = (value: GoValue | undefined): number | undefined =>
  Array.isArray(value) ? readFirstNumber(value[0]) : readGoNumber(value);

// A frames or parameters bag path the kit holds under one of its character's constants' names takes that constant, cited at
// The line it is declared on, or at its first state's line where it is a list. The name is the join key, as holds and presses
// Are read from gcsim's names. Only the paths the kit holds are read, so no path is added the module does not use
export const addGcsimNamedConstantCandidates = (
  { add, toFile }: GcsimKitCandidateWriter,
  { constantMap }: GcsimCharacter,
  bagPaths: ReadonlySet<string>,
): void => {
  for (const path of bagPaths) {
    const name = BAG_PATH_REGEX.exec(path)?.groups?.name;
    const constant = name === undefined ? undefined : findGcsimConstant(constantMap, name);
    const value = readFirstNumber(constant?.value);
    if (constant === undefined || value === undefined) continue;
    const line = Array.isArray(constant.value) ? (constant.elementLines[0] ?? constant.line) : constant.line;
    add(path, value, toFile(constant.file), line);
  }
};
