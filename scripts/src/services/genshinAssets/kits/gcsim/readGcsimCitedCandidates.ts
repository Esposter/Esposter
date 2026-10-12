import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { GCSIM_CHARACTERS_PATH } from "#src/services/genshinAssets/kits/constants";
import { readGcsimCitedArea } from "#src/services/genshinAssets/kits/gcsim/readGcsimCitedArea";
import { readGcsimEnclosingLoop } from "#src/services/genshinAssets/kits/gcsim/readGcsimEnclosingLoop";
import { readGcsimLineValues } from "#src/services/genshinAssets/kits/gcsim/readGcsimLineValues";
import { checkIsKitValueEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueEqual";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The value a cited line gives: its one value equal to the cited value, or its first where none is, and inside a `for`
// Loop, an array of that line's value at each index of the loop, taken at the one expression position whose values
// Equal the cited array, or at the first position where none does
const readCitedValue = (lines: readonly string[], lineIndex: number, citedValue: unknown, file: string): unknown => {
  const lineText = lines[lineIndex] ?? "";
  // An area is cited by the constructor on its line, whole, as its object is the one value of its line
  if (typeof citedValue === "object" && citedValue !== null && !Array.isArray(citedValue))
    return readGcsimCitedArea(lineText, file);
  const loop = readGcsimEnclosingLoop(lines, lineIndex);
  if (loop === undefined) {
    const lineValues = readGcsimLineValues(lineText);
    return lineValues.find((lineValue) => checkIsKitValueEqual(lineValue, citedValue)) ?? lineValues[0];
  }
  if (loop.count === 0) return undefined;
  const valuesByIndex = Array.from({ length: loop.count }, (_value, index) =>
    readGcsimLineValues(lineText, (name) => (name === loop.index ? index : undefined)),
  );
  const positions = Array.from(
    { length: Math.min(...valuesByIndex.map((values) => values.length)) },
    (_value, position) => position,
  );
  const arrayAt = (position: number) => valuesByIndex.map((values) => values[position]);
  const array = arrayAt(positions.find((position) => checkIsKitValueEqual(arrayAt(position), citedValue)) ?? 0);
  return array.every((value) => value !== undefined) ? array : undefined;
};

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
    const lines = readFileSync(join(gcsimDirectory, file), "utf8").split("\n");
    const value = readCitedValue(lines, entry.line - 1, entry.value, file);
    if (value === undefined) continue;
    addKitCandidate(candidateMap, path, { provenance: { file, line: entry.line, source: KitSource.Gcsim }, value });
  }
  return candidateMap;
};
