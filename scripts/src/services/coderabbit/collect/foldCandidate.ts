import type { FoldInput } from "#src/models/coderabbit/collect/FoldInput";

import { MergeMainOutcome } from "#src/models/coderabbit/collect/MergeMainOutcome";
import { mergeMain } from "#src/services/coderabbit/collect/mergeMain";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readWindowFileCount } from "#src/services/coderabbit/collect/readWindowFileCount";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// Fold `main` into the candidate the port built and name the sha `develop` is pushed to. The fold is never
// Undone for the cap: the window is counted on the pull request's own side of `main` (`readWindowFileCount`), so
// What `main` brings costs the review nothing. Nothing is verified here: `develop`'s own CI is the check
// (`REPAIR_VERIFY_COMMANDS` says why).
export const foldCandidate = async ({
  collectorSha,
  cwd,
  developSha,
  fixCount,
  mergeBaseSha,
  queueSha,
  queueShas,
  viewerLogin,
}: FoldInput): Promise<string> => {
  const mergeOutcome = await mergeMain({ collectorSha, cwd, viewerLogin });
  const isMainMerged = mergeOutcome === MergeMainOutcome.Merged;
  // A fast-forward moves develop to the queue's own sha, so it must carry exactly what was measured: no fixes
  // Ahead, the queue sitting on develop, no fold of `main` on top, and nothing between develop and the cut the
  // Port did not pick. That last one is the whole of it — a commit the port skipped is one no count ever saw,
  // And a commit claiming no review smuggled onto develop this way is read by the review the claim exempted it
  // From, over a cap measured without it. A merge among the ancestors fails the same count
  const cutSha = queueShas.at(-1);
  const mergeBase = runGit(["merge-base", developSha, queueSha], cwd).trim();
  const isCutExact =
    cutSha === undefined ||
    getNonEmptyLines(runGit(["rev-list", `${developSha}..${cutSha}`], cwd)).length === queueShas.length;
  const isFastForward = fixCount === 0 && mergeBase === developSha && isCutExact && !isMainMerged;
  const targetSha = isFastForward ? (cutSha ?? developSha) : readHeadSha(cwd);
  console.info(
    `cut: ${queueShas.length} queue commits = ${readWindowFileCount(mergeBaseSha, cwd)} files${isMainMerged ? ", main folded in" : ""}${mergeOutcome === MergeMainOutcome.Conflicted ? ", main conflicts past the resolver's attempts — the release merge is a person's" : ""}${isFastForward ? ", fast-forward" : ""}`,
  );
  return targetSha;
};
