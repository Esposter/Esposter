import { readExcludedGlobs } from "#src/services/coderabbit/collect/readExcludedGlobs";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { matchesGlob } from "node:path";

// The files of a diff the bot's review counts: every path `range` changes, less the ones the base's path filters leave
// Out (`readExcludedGlobs`). The one counter, so a window, a commit the reshaper measures and each part it leaves are
// Counted alike, and a commit no window can take is never one that only looks too big unfiltered
export const readReviewedFilePaths = (baseSha: string, range: string, cwd?: string): string[] => {
  const excludedGlobs = readExcludedGlobs(baseSha, cwd);
  return getNonEmptyLines(runGit(["diff", "--name-only", range], cwd)).filter(
    (path) => !excludedGlobs.some((glob) => matchesGlob(path, glob)),
  );
};
