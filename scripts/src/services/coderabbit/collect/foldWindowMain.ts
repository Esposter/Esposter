import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { FoldWindowInput } from "#src/models/coderabbit/collect/FoldWindowInput";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { MergeMainOutcome } from "#src/models/coderabbit/collect/MergeMainOutcome";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { mergeMain } from "#src/services/coderabbit/collect/mergeMain";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { runGit } from "#src/services/shared/runGit";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

// A reviewed window `main` has diverged from since it was pushed — a repair or an express cut landing after the push —
// Merges on GitHub only while the two still merge cleanly. When they conflict, `main` is folded into the window's head
// Here, by the same resolver the window's fold uses, and the fold is pushed to `main` itself: it descends from both,
// And GitHub closes a pull request whose head its base now carries as merged. The fold adds nothing but `main`'s own
// Content, so no review is owed for it. A clean merge is left to GitHub.
export const foldWindowMain = async ({
  collectorSha,
  cwd,
  headSha,
  isDryRun,
  mainSha,
  viewerLogin,
}: FoldWindowInput): Promise<CycleOutcome | undefined> => {
  if (checkIsAncestor(mainSha, headSha, cwd)) return undefined;
  // `merge-tree` exits non-zero on a conflict and writes nothing to the checkout
  const isClean = getResult(() => runGit(["merge-tree", "--write-tree", headSha, mainSha], cwd)).match(
    () => true,
    () => false,
  );
  if (isClean) return undefined;
  else if (isDryRun)
    return {
      kind: CycleOutcomeKind.Merged,
      reason: `would fold ${MAIN_BRANCH} into the window at ${headSha} and push the fold to ${MAIN_BRANCH} — the window conflicts with it`,
    };

  runGit(["switch", "--detach", headSha], cwd);
  const mergeOutcome = await mergeMain({ collectorSha, cwd, viewerLogin });
  if (mergeOutcome === MergeMainOutcome.Conflicted)
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      `the window at ${headSha} conflicts with ${MAIN_BRANCH} at ${mainSha} past the resolver's attempts — a person merges ${MAIN_BRANCH} into it`,
    );

  const targetSha = readHeadSha(cwd);
  if (!pushBranch({ branch: MAIN_BRANCH, cwd, expectedSha: mainSha, isDryRun, sha: targetSha }))
    return getMovedOutcome(MAIN_BRANCH);
  return {
    kind: CycleOutcomeKind.Merged,
    reason: `${MAIN_BRANCH} folded into the window and the fold pushed to ${MAIN_BRANCH} — the window conflicted with it`,
    targetSha,
  };
};
