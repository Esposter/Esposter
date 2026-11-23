import type { CitingPage } from "#src/models/shared/CitingPage";

import { getSourceComments } from "#src/services/citations/getSourceComments";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { SOURCE_EXTENSION_REGEX } from "#src/services/sweeps/staleNames/constants";
import { readGeneratedPatterns } from "#src/services/sweeps/staleNames/readGeneratedPatterns";
import { readFileSync } from "node:fs";
import { matchesGlob, resolve } from "node:path";

// The comments of every source file the stale-names scan reads, each as a page of its own, so the judgement a page's
// Citations get reads them the same way. A generated file is left out, as its words are
export const readSourceComments = (): CitingPage[] => {
  const generatedPatterns = readGeneratedPatterns();
  return readSweepFilePaths(".")
    .filter(
      (path) => SOURCE_EXTENSION_REGEX.test(path) && !generatedPatterns.some((pattern) => matchesGlob(path, pattern)),
    )
    .map((path) => ({
      path,
      text: getSourceComments(path, readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")).comments.join("\n"),
    }));
};
