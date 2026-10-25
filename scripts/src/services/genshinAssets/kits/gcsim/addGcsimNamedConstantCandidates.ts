import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { readFirstGoFrames } from "#src/services/genshinAssets/kits/gcsim/readFirstGoFrames";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";

const BAG_PATH_REGEX = /^(?:frames|parameters)\.(?<name>[^.]+)$/u;

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
    const value = readGoNumber(readFirstGoFrames(constant?.value));
    if (constant === undefined || value === undefined) continue;
    const line = Array.isArray(constant.value) ? (constant.elementLines[0] ?? constant.line) : constant.line;
    add(path, value, toFile(constant.file), line);
  }
};
