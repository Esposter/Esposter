import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import { EXPRESS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { getPortedShas } from "#src/services/coderabbit/collect/getPortedShas";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readFileCount } from "#src/services/coderabbit/collect/readFileCount";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// What proves a reshaping, asked of the tree rather than of the session: the same final tree as the original —
// Repackaged, never edited — and every commit that claims no exemption under the cap. Nothing here reads the
// Session's word. The first failing check is the reason, or nothing when every one holds.
export const readReshapeFailure = (originalSha: string, cwd?: string): string | undefined => {
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
  // The original's body names every copy it was replayed from, and a part keeping those lines shares them with
  // Its siblings: the express lane's copy of one part would then read every part as ported, and the next sync
  // Would drop the rest unreplayed (`readCherryShas`). A part is a new commit, with no lineage of its own yet
  const partBodies = runGit(["log", "--format=%b", `${originalSha}^..HEAD`], cwd);
  if (getPortedShas(partBodies).size > 0) return `left a part naming the copies ${originalSha} was replayed from`;
  const claimedShas = readTrailedShas(shas, EXPRESS_TRAILER, cwd);
  const oversized = shas.find(
    (sha) => !claimedShas.has(sha) && readFileCount(`${sha}^..${sha}`, cwd) > REVIEW_FILE_CAP,
  );
  return oversized === undefined ? undefined : `left ${oversized} over the cap without an ${EXPRESS_TRAILER} trailer`;
};
