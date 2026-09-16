import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import { EXPRESS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { getFileCount } from "#src/services/coderabbit/collect/getFileCount";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readTrailerValues } from "#src/services/coderabbit/collect/readTrailerValues";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { getResult } from "@esposter/shared";

// What proves a reshaping, asked of the tree rather than of the session: the same final tree as the original —
// Repackaged, never edited — and every commit that claims no exemption under the cap. Nothing here reads the
// Session's word. The first failing check is the reason, or nothing when every one holds.
export const getReshapeFailure = (originalSha: string, cwd?: string): string | undefined => {
  if (checkIsSequencing(cwd)) return "left an operation in progress";
  const dirtyPaths = readDirtyPaths(cwd);
  if (dirtyPaths.length > 0) return `left the working tree dirty:\n${dirtyPaths.join("\n")}`;
  const isSameTree = getResult(() => runGit(["diff", "--quiet", originalSha, "HEAD"], cwd)).match(
    () => true,
    () => false,
  );
  if (!isSameTree) return `left a tree that differs from ${originalSha}`;
  const shas = getNonEmptyLines(runGit(["rev-list", "--reverse", `${originalSha}^..HEAD`], cwd));
  if (shas.length === 0) return "produced no commit";
  const oversized = shas.find(
    (sha) =>
      readTrailerValues(sha, EXPRESS_TRAILER, cwd).length === 0 &&
      getFileCount(`${sha}^..${sha}`, cwd) > REVIEW_FILE_CAP,
  );
  return oversized === undefined ? undefined : `left ${oversized} over the cap without an ${EXPRESS_TRAILER} trailer`;
};
