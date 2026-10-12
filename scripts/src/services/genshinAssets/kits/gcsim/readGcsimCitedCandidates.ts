import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { GCSIM_CHARACTERS_PATH } from "#src/services/genshinAssets/kits/constants";
import { readGcsimLineValues } from "#src/services/genshinAssets/kits/gcsim/readGcsimLineValues";
import { checkIsKitValueEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueEqual";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The candidates of the overlay's cited values: each cited line of a gcsim character's folder gives a Gcsim candidate with
// That file and line, its value the one the line evaluates to that equals the cited value, or its first value where none
// Does, so a citation the line does not give reads as a difference
export const readGcsimCitedCandidates = (
  overlay: KitOverlay,
  gcsimDirectory: string,
  folder: string,
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  for (const [path, entry] of Object.entries(overlay)) {
    if (!("file" in entry) || entry.value === undefined) continue;
    const file = `${GCSIM_CHARACTERS_PATH}/${folder}/${entry.file}`;
    const lineText = readFileSync(join(gcsimDirectory, file), "utf8").split("\n")[entry.line - 1] ?? "";
    const lineValues = readGcsimLineValues(lineText);
    const value = lineValues.find((lineValue) => checkIsKitValueEqual(lineValue, entry.value)) ?? lineValues[0];
    if (value === undefined) continue;
    addKitCandidate(candidateMap, path, { provenance: { file, line: entry.line, source: KitSource.Gcsim }, value });
  }
  return candidateMap;
};
