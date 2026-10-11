import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { FoldWindowInput } from "#src/models/coderabbit/collect/FoldWindowInput";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { MergeMainOutcome } from "#src/models/coderabbit/collect/MergeMainOutcome";
import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { ATTEMPT_RETRY_DELAY_SECONDS, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { getWindowFileCap } from "#src/services/coderabbit/collect/getWindowFileCap";
import { mergeMain } from "#src/services/coderabbit/collect/mergeMain";
import { parkCommits } from "#src/services/coderabbit/collect/parkCommits";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readRecutFileCaps } from "#src/services/coderabbit/collect/readRecutFileCaps";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { recutWindowStack } from "#src/services/coderabbit/collect/recutWindowStack";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// A reviewed window `main` has diverged from since it was pushed — a repair or an express cut landing after the push —
// Merges on GitHub only while the two still merge cleanly. When they conflict, `main` is folded into the window's head
// Here, by the same resolver the window's fold uses, and the fold is pushed to `main` itself: it descends from both,
// And GitHub closes a pull request whose head its base now carries as merged. The fold adds nothing but `main`'s own
// Content, so no review is owed for it. A clean merge is left to GitHub. Past the resolver's attempts the window's
// Commits that touch a conflicted path are parked on held branches and the window is cut again without them, at the cap
// It was cut under, so the next run opens a window that merges.
export const foldWindowMain = async ({
  collectorSha,
  cwd,
  headSha,
  isDryRun,
  mainSha,
  viewerLogin,
  window,
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
  if (mergeOutcome === MergeMainOutcome.Conflicted) {
    // `merge-tree` reports a conflict by exiting non-zero, so its paths — each line after the tree it would write — are
    // Read off the failure
    const conflictedPaths = getResult(() =>
      runGit(["merge-tree", "--write-tree", "--name-only", "--no-messages", headSha, mainSha], cwd),
    ).match(
      () => [],
      (error) => ("stdout" in error && typeof error.stdout === "string" ? getNonEmptyLines(error.stdout).slice(1) : []),
    );
    const mergeBaseSha = runGit(["merge-base", mainSha, headSha], cwd).trim();
    const readWindowShas = (paths: string[]): string[] =>
      getNonEmptyLines(
        runGit(["rev-list", "--reverse", "--no-merges", `${mergeBaseSha}..${headSha}`, "--", ...paths], cwd),
      );
    // A conflict that only a merge inside the window wrote parks the whole window, since a cut of the same commits would
    // Meet it again
    const conflictingShas = readWindowShas(conflictedPaths);
    parkCommits({
      cause: `they conflict with ${MAIN_BRANCH} at ${mainSha} past the resolver's attempts`,
      cwd,
      isDryRun,
      shas: conflictingShas.length > 0 ? conflictingShas : readWindowShas([]),
      viewerLogin,
    });
    const windowHistory = readWindowPullRequests(WindowPullRequestListState.All);
    const recut = recutWindowStack({
      cwd,
      fileCap: getWindowFileCap(
        windowHistory.filter(({ number }) => number < window.number),
        readRecutFileCaps(windowHistory, viewerLogin),
      ),
      isDryRun,
      reason: `pull request #${window.number} conflicts with ${MAIN_BRANCH} at ${mainSha} past the resolver's attempts, so the commits it conflicts on are parked and the rest are cut again`,
      window,
    });
    return { kind: CycleOutcomeKind.Idle, reason: recut.reason, retriggerDelaySeconds: ATTEMPT_RETRY_DELAY_SECONDS };
  }

  const targetSha = readHeadSha(cwd);
  if (!pushBranch({ branch: MAIN_BRANCH, cwd, expectedSha: mainSha, isDryRun, sha: targetSha }))
    return getMovedOutcome(MAIN_BRANCH);
  return {
    kind: CycleOutcomeKind.Merged,
    reason: `${MAIN_BRANCH} folded into the window and the fold pushed to ${MAIN_BRANCH} — the window conflicted with it`,
    targetSha,
  };
};
