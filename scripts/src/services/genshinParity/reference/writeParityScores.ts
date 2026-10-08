import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";

import { mergeParityScores } from "#src/services/genshinParity/reference/mergeParityScores";
import { PARITY_SCORES_PATH } from "#src/services/genshinParity/shared/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

// The committed report rewritten with the given scores (`mergeParityScores`), in the map's order
export const writeParityScores = async (scores: Readonly<Record<string, ParityScore>>): Promise<void> => {
  const lines = existsSync(PARITY_SCORES_PATH) ? (await readFile(PARITY_SCORES_PATH, "utf8")).split("\n") : [];
  await writeFile(PARITY_SCORES_PATH, mergeParityScores(lines, scores, Object.keys(ParityReferenceMap)));
};
