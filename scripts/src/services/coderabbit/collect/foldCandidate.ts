import type { FoldInput } from "#src/models/coderabbit/collect/FoldInput";

import { MergeMainOutcome } from "#src/models/coderabbit/collect/MergeMainOutcome";
import { getFileCount } from "#src/services/coderabbit/collect/getFileCount";
import { mergeMain } from "#src/services/coderabbit/collect/mergeMain";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// Fold `main` into the candidate the port built and name the sha `develop` is pushed to. Nothing is verified
// Here: `develop`'s own CI is the check (`EXPRESS_VERIFY_COMMANDS` says why the express lane differs).
export const foldCandidate = ({ cwd, developSha, fixCount, frontierSha, queueSha, queueShas }: FoldInput): string => {
  const portHeadSha = readHeadSha(cwd);
  const mergeOutcome = mergeMain(cwd);
  let isMainMerged = mergeOutcome === MergeMainOutcome.Merged;
  // The pick loop never measured the merge's own diff, so a fold landing main's backlog is undone rather than
  // Pushed over budget — undone, not shrunk, since nothing here knows which of main's files to drop
  if (isMainMerged && getFileCount(`${frontierSha}..HEAD`, cwd) > REVIEW_FILE_CAP) {
    runGit(["reset", "--hard", portHeadSha], cwd);
    console.info("main not folded — the fold alone put the window over the file cap");
    isMainMerged = false;
  }

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
    `cut: ${queueShas.length} queue commits = ${getFileCount(`${frontierSha}..${targetSha}`, cwd)} files${isMainMerged ? ", main folded in" : ""}${mergeOutcome === MergeMainOutcome.Conflicted ? ", main conflicts outside the lockfile — held for a person" : ""}${isFastForward ? ", fast-forward" : ""}`,
  );
  return targetSha;
};
