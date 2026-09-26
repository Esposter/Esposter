import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { FoldReleaseInput } from "#src/models/coderabbit/collect/FoldReleaseInput";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { MergeMainOutcome } from "#src/models/coderabbit/collect/MergeMainOutcome";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { DEVELOP_BRANCH, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { mergeMain } from "#src/services/coderabbit/collect/mergeMain";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { runGit } from "#src/services/shared/runGit";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

// A reviewed release `main` has diverged from since its window went out — a repair or an express cut landing after
// The push — merges on GitHub only while the two still merge cleanly. When they conflict, `main` is folded into
// `develop`'s head here, by the same resolver the window's fold uses, and the fold is pushed to `main` itself: it
// Descends from both, and GitHub closes a pull request whose head its base now carries as merged. The fold adds
// Nothing but `main`'s own content, so no review is owed for it. A clean merge is left to GitHub.
export const foldReleaseMain = async ({
  collectorSha,
  cwd,
  developSha,
  isDryRun,
  mainSha,
  viewerLogin,
}: FoldReleaseInput): Promise<CycleOutcome | undefined> => {
  if (checkIsAncestor(mainSha, developSha, cwd)) return undefined;
  // `merge-tree` exits non-zero on a conflict and writes nothing to the checkout
  const isClean = getResult(() => runGit(["merge-tree", "--write-tree", developSha, mainSha], cwd)).match(
    () => true,
    () => false,
  );
  if (isClean) return undefined;
  else if (isDryRun)
    return {
      kind: CycleOutcomeKind.Merged,
      reason: `would fold ${MAIN_BRANCH} into ${DEVELOP_BRANCH} and push the fold to ${MAIN_BRANCH} — the release conflicts with it`,
    };

  runGit(["switch", "--detach", developSha], cwd);
  const mergeOutcome = await mergeMain({ collectorSha, cwd, viewerLogin });
  if (mergeOutcome === MergeMainOutcome.Conflicted)
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      `the release conflicts with ${MAIN_BRANCH} at ${mainSha} past the resolver's attempts — a person merges ${MAIN_BRANCH} into ${DEVELOP_BRANCH}`,
    );

  const targetSha = readHeadSha(cwd);
  if (!pushBranch({ branch: MAIN_BRANCH, cwd, expectedSha: mainSha, isDryRun, sha: targetSha }))
    return getMovedOutcome(MAIN_BRANCH);
  return {
    kind: CycleOutcomeKind.Merged,
    reason: `${MAIN_BRANCH} folded into the release and the fold pushed to ${MAIN_BRANCH} — the release conflicted with it`,
    targetSha,
  };
};
