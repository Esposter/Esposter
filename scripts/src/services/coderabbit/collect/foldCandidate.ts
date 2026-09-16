import type { FoldInput } from "#src/models/coderabbit/collect/FoldInput";

import { MergeMainOutcome } from "#src/models/coderabbit/collect/MergeMainOutcome";
import { getWindowFileCount } from "#src/services/coderabbit/collect/getWindowFileCount";
import { mergeMain } from "#src/services/coderabbit/collect/mergeMain";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// Fold `main` into the candidate the port built and name the sha `develop` is pushed to. The fold is never
// Undone for the cap: the window is counted on the pull request's own side of `main` (`getWindowFileCount`), so
// What `main` brings costs the review nothing. Nothing is verified here: `develop`'s own CI is the check
// (`EXPRESS_VERIFY_COMMANDS` says why the express lane differs).
export const foldCandidate = async ({
  cwd,
  developSha,
  fixCount,
  frontierSha,
  queueSha,
  queueShas,
  viewerLogin,
}: FoldInput): Promise<string> => {
  const mergeOutcome = await mergeMain({ cwd, viewerLogin });
  const isMainMerged = mergeOutcome === MergeMainOutcome.Merged;
  // A fast-forward moves develop to the queue's own sha, so it must carry exactly what was measured: no fixes
  // Ahead, the queue sitting on develop, no merge among the cut's ancestors, and no fold of `main` on top
  const cutSha = queueShas.at(-1);
  const mergeBase = runGit(["merge-base", developSha, queueSha], cwd).trim();
  const isMergeFree =
    cutSha === undefined ||
    getNonEmptyLines(runGit(["rev-list", "--merges", `${developSha}..${cutSha}`], cwd)).length === 0;
  const isFastForward = fixCount === 0 && mergeBase === developSha && isMergeFree && !isMainMerged;
  const targetSha = isFastForward ? (cutSha ?? developSha) : readHeadSha(cwd);
  console.info(
    `cut: ${queueShas.length} queue commits = ${getWindowFileCount(frontierSha, cwd)} files${isMainMerged ? ", main folded in" : ""}${mergeOutcome === MergeMainOutcome.Conflicted ? ", main conflicts past the resolver's attempts — the release merge is a person's" : ""}${isFastForward ? ", fast-forward" : ""}`,
  );
  return targetSha;
};
