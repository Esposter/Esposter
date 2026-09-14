import type { FoldInput } from "#src/models/coderabbit/collect/FoldInput";

import { MergeMainOutcome } from "#src/models/coderabbit/collect/MergeMainOutcome";
import { getFileCount } from "#src/services/coderabbit/collect/getFileCount";
import { mergeMain } from "#src/services/coderabbit/collect/mergeMain";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// Fold `main` into the candidate the port built and name the sha `develop` is pushed to. Nothing is verified
// Here: the window is what the port measured, `develop`'s own CI is the check, and a red there is one more commit
// In the next window (`EXPRESS_VERIFY_COMMANDS` says why the express lane is the exception). A fold that goes
// Wrong is undone rather than blamed on the queue: the window goes out without it, as it does when the merge
// Conflicts, and the fold tries again next window.
export const foldCandidate = ({ cwd, developSha, fixCount, frontierSha, queueSha, queueShas }: FoldInput): string => {
  const portHeadSha = runGit(["rev-parse", "HEAD"], cwd).trim();
  const mergeOutcome = mergeMain(cwd);
  let isMainMerged = mergeOutcome === MergeMainOutcome.Merged;
  // A merge's own diff is never measured by the pick loop — that counts fixes and queue commits alone — so a fold
  // Landing main's own backlog of files is undone rather than pushed over budget. Undone, not shrunk: nothing here
  // Knows which of main's files to drop.
  if (isMainMerged && getFileCount(`${frontierSha}..HEAD`, cwd) > REVIEW_FILE_CAP) {
    runGit(["reset", "--hard", portHeadSha], cwd);
    console.info("main not folded — the fold alone put the window over the file cap");
    isMainMerged = false;
  }

  // A fast-forward moves develop to the queue's own sha, so it must carry exactly what was measured: no fixes
  // Ahead of it, the queue sitting on develop, no skipped merge among the cut's ancestors — a merge's own diff
  // Was never counted, and a fast-forward would land it anyway — and no fold of `main` on top.
  const cutSha = queueShas.at(-1);
  const mergeBase = runGit(["merge-base", developSha, queueSha], cwd).trim();
  const isMergeFree =
    cutSha === undefined ||
    getNonEmptyLines(runGit(["rev-list", "--merges", `${developSha}..${cutSha}`], cwd)).length === 0;
  const isFastForward = fixCount === 0 && mergeBase === developSha && isMergeFree && !isMainMerged;
  const targetSha = isFastForward ? (cutSha ?? developSha) : runGit(["rev-parse", "HEAD"], cwd).trim();
  console.info(
    `cut: ${queueShas.length} queue commits = ${getFileCount(`${frontierSha}..${targetSha}`, cwd)} files${isMainMerged ? ", main folded in" : ""}${mergeOutcome === MergeMainOutcome.Conflicted ? ", main conflicts outside the lockfile — held for a person" : ""}${isFastForward ? ", fast-forward" : ""}`,
  );
  return targetSha;
};
