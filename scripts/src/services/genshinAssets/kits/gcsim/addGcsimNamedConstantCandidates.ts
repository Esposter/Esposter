import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";
import type { KitRecord } from "genshin-world";

import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";

// The first number of a constant, descending through each level's first element where it is a list of states
const readFirstNumber = (value: GoValue | undefined): number | undefined =>
  Array.isArray(value) ? readFirstNumber(value[0]) : typeof value === "number" ? value : undefined;

// A frames or parameters bag entry the record holds under a name of one of its character's constants takes that constant,
// Cited at the line it is declared on, or at its first state's line where it is a list. The name is the join key, as holds
// And presses are read from gcsim's names. Only the names the record holds are read, so no path is added the module does not use
export const addGcsimNamedConstantCandidates = (
  { add, toFile }: GcsimKitCandidateWriter,
  { constantMap }: GcsimCharacter,
  { frames = {}, parameters = {} }: Pick<KitRecord, "frames" | "parameters">,
): void => {
  for (const [bag, entries] of [
    ["frames", frames],
    ["parameters", parameters],
  ] as const)
    for (const name of Object.keys(entries)) {
      const constant = findGcsimConstant(constantMap, name);
      const value = readFirstNumber(constant?.value);
      if (constant === undefined || value === undefined) continue;
      const line = Array.isArray(constant.value) ? (constant.elementLines[0] ?? constant.line) : constant.line;
      add(`${bag}.${name}`, value, toFile(constant.file), line);
    }
};
