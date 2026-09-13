import type { CutInput } from "#src/models/coderabbit/collect/CutInput";
import type { CutResult } from "#src/models/coderabbit/collect/CutResult";

import { GREEN_CUT_RETRY_LIMIT } from "#src/services/coderabbit/collect/constants";
import { mergeMain } from "#src/services/coderabbit/collect/mergeMain";
import { verifyCandidate } from "#src/services/coderabbit/collect/verifyCandidate";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The cut is green on its own, or it shrinks until it is: a red head drops its last queue commit and re-verifies,
// A bounded number of times. Only then is `main` folded in, and only then verified again — the fold comes after
// The loop because the loop drops `HEAD~1`, and on a merge commit that is the fold rather than the queue commit,
// So a fold made first would be silently lost on the first red head while the log kept counting the commit it
// Meant to drop. A fold that turns a green cut red is undone rather than blamed on the queue: the bump on `main`
// Is what broke it, and the window goes out without it, as it does when the merge conflicts.
export const cutCandidate = ({ cwd, developSha, fixCount, queueSha, queueShas }: CutInput): CutResult => {
  const keptShas = [...queueShas];
  let retries = GREEN_CUT_RETRY_LIMIT;
  while (!verifyCandidate(cwd)) {
    if (keptShas.length === 0)
      throw new InvalidOperationError(
        Operation.Update,
        "coderabbit",
        "the fixes alone are red — the drain touched more than its findings",
      );
    else if (retries === 0)
      throw new InvalidOperationError(
        Operation.Update,
        "coderabbit",
        `no green cut within the retry limit — held from ${keptShas[0] ?? ""}`,
      );
    runGit(["reset", "--hard", "HEAD~1"], cwd);
    keptShas.pop();
    retries -= 1;
    // Nothing left to verify: develop itself is the candidate, and the caller pushes nothing
    if (keptShas.length === 0 && fixCount === 0)
      return { isFastForward: false, isMainMerged: false, queueShas: keptShas, targetSha: developSha };
  }

  const pickHeadSha = runGit(["rev-parse", "HEAD"], cwd).trim();
  let isMainMerged = mergeMain(cwd);
  if (isMainMerged && !verifyCandidate(cwd)) {
    runGit(["reset", "--hard", pickHeadSha], cwd);
    console.info("main not folded — the fold turned the cut red, so it waits for the next window");
    isMainMerged = false;
  }

  // A fast-forward moves develop to the queue's own sha, so it must carry exactly what was measured: no fixes
  // Ahead of it, the queue sitting on develop, no skipped merge among the cut's ancestors — a merge's own diff
  // Was never counted, and a fast-forward would land it anyway — and no fold of `main` on top.
  const cutSha = keptShas.at(-1);
  const mergeBase = runGit(["merge-base", developSha, queueSha], cwd).trim();
  const isMergeFree =
    cutSha === undefined ||
    getNonEmptyLines(runGit(["rev-list", "--merges", `${developSha}..${cutSha}`], cwd)).length === 0;
  const isFastForward = fixCount === 0 && mergeBase === developSha && isMergeFree && !isMainMerged;
  return {
    isFastForward,
    isMainMerged,
    queueShas: keptShas,
    targetSha: isFastForward ? (cutSha ?? developSha) : runGit(["rev-parse", "HEAD"], cwd).trim(),
  };
};
