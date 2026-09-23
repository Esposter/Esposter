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

// A clean release `main` has diverged from since its window went out — a repair or an express cut landing after
// The push — merges on GitHub only while the two still merge cleanly. When they conflict, `main` is folded into
// `develop` here, by the same resolver the window's fold uses, and the release waits on a review of the new head
// Rather than failing its merge on every run. A clean merge is left to GitHub: folding it would spend a review
// On nothing a conflict asked for.
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
      kind: CycleOutcomeKind.Pushed,
      reason: `would fold ${MAIN_BRANCH} into ${DEVELOP_BRANCH} — the release conflicts with it`,
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
  if (!pushBranch({ branch: DEVELOP_BRANCH, cwd, expectedSha: developSha, isDryRun, sha: targetSha }))
    return getMovedOutcome(DEVELOP_BRANCH);
  return {
    kind: CycleOutcomeKind.Pushed,
    reason: `${MAIN_BRANCH} folded into ${DEVELOP_BRANCH} — the release conflicted with it, and merges once the new head is reviewed`,
    targetSha,
  };
};
