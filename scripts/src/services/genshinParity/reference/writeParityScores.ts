import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";

import { ParityReportRun } from "#src/models/genshinParity/reference/ParityReportRun";
import { PARITY_SCORES_PATH } from "#src/services/genshinParity/reference/constants";
import { mergeParityScores } from "#src/services/genshinParity/reference/mergeParityScores";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

// The committed report rewritten with the given scores (`mergeParityScores`), in the map's order. The caller names the run:
// Only `compare --all` visits every reference, so it is the one full run, and every other write is a subset run that keeps
// The rows it did not score
export const writeParityScores = async (
  scores: Readonly<Record<string, ParityScore>>,
  run: ParityReportRun,
): Promise<void> => {
  const lines = existsSync(PARITY_SCORES_PATH) ? (await readFile(PARITY_SCORES_PATH, "utf8")).split("\n") : [];
  await writeFile(
    PARITY_SCORES_PATH,
    mergeParityScores(lines, scores, Object.keys(ParityReferenceMap), ParityReferenceMap, run),
  );
};
