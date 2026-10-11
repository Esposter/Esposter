import { readPathFilterGlobs } from "#src/services/coderabbit/collect/readPathFilterGlobs";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { matchesGlob } from "node:path";

// The files of a diff the bot's review counts: every path `range` changes, kept to the paths the base's own
// `.coderabbit.yaml` path filters include, when it lists any, and less every path they exclude, since the bot reads its
// Config from the base and states its count after them. The one counter, so a window, a commit the reshaper measures and
// Each part it leaves are counted alike, and a commit no window can take is never one that only looks too big unfiltered
export const readReviewedFilePaths = (baseSha: string, range: string, cwd?: string): string[] => {
  const { excludedGlobs, includedGlobs } = readPathFilterGlobs(baseSha, cwd);
  return getNonEmptyLines(runGit(["diff", "--name-only", range], cwd)).filter(
    (path) =>
      (includedGlobs.length === 0 || includedGlobs.some((glob) => matchesGlob(path, glob))) &&
      !excludedGlobs.some((glob) => matchesGlob(path, glob)),
  );
};
