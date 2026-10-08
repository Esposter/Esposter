import type { MergeBottomWindowInput } from "#src/models/coderabbit/collect/MergeBottomWindowInput";
import type { WindowMergeStep } from "#src/models/coderabbit/collect/WindowMergeStep";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import {
  ATTEMPT_RETRY_DELAY_SECONDS,
  MAIN_BRANCH,
  SESSION_PROBE_PROMPT,
  SessionRoleModelMap,
} from "#src/services/coderabbit/collect/constants";
import { drainWindow } from "#src/services/coderabbit/collect/drainWindow";
import { foldWindowMain } from "#src/services/coderabbit/collect/foldWindowMain";
import { mergeWindowPullRequest } from "#src/services/coderabbit/collect/mergeWindowPullRequest";
import { readBranchShas } from "#src/services/coderabbit/collect/readBranchShas";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { runGh } from "#src/services/shared/runGh";
import { runGit } from "#src/services/shared/runGit";
import { getResult, InvalidOperationError, noop, Operation } from "@esposter/shared";

// A failed retarget is logged rather than thrown, so the drain still runs: the window above is retargeted by the next run
const retargetPullRequest = (pullRequest: number): boolean =>
  getResult(() => runGh(["pr", "edit", pullRequest.toString(), "--base", MAIN_BRANCH])).match(
    () => true,
    (error) => {
      console.error(error);
      return false;
    },
  );

// The bottom window of the stack, merged once its review completes, and its findings drained before anything above it
// Is looked at. Order matters: the next window is retargeted to `main` before this one's branch is deleted, since
// Deleting a base branch closes every pull request stacked on it. A session has to be able to start first, since the
// Findings are answered after the merge.
export const mergeBottomWindow = async ({
  collectorSha,
  cwd,
  developSha,
  isDryRun,
  next,
  queueSha,
  reviewFixesSha,
  viewerLogin,
  window,
}: MergeBottomWindowInput): Promise<WindowMergeStep> => {
  const { headRefName, number } = window;
  if (!isDryRun) {
    const { isEnded, isStarted } = await runSession({
      cwd,
      model: SessionRoleModelMap[SessionRole.Drain],
      prompt: SESSION_PROBE_PROMPT,
    });
    if (!isStarted)
      return {
        outcome: {
          kind: CycleOutcomeKind.Idle,
          reason: "no session could start — the window waits for one that can drain its findings",
        },
        reviewFixesSha,
      };
    else if (!isEnded)
      return {
        outcome: {
          kind: CycleOutcomeKind.Idle,
          reason: "the session probe exited non-zero — the window waits for a session that can drain its findings",
        },
        retriggerDelaySeconds: ATTEMPT_RETRY_DELAY_SECONDS,
        reviewFixesSha,
      };
  }

  const headSha = readSha(`origin/${headRefName}`, cwd);
  if (headSha === undefined)
    throw new InvalidOperationError(Operation.Read, "coderabbit", `${headRefName} is missing on the remote`);
  const { mainSha } = readBranchShas(cwd);
  // A window `main` conflicts with is folded and the fold pushed, which GitHub reads as the window merged
  const fold = await foldWindowMain({ collectorSha, cwd, headSha, isDryRun, mainSha, viewerLogin });
  if (fold?.kind === CycleOutcomeKind.Idle) return { outcome: fold, reviewFixesSha };
  else if (fold === undefined) mergeWindowPullRequest({ headSha, isDryRun, pullRequest: number });

  // A failed retarget leaves the window above stranded on this branch, which the next run retargets before it reads the
  // Stack (`retargetStrandedWindows`). The branch stays until it lands, and the drain below does not wait on it
  const isRetargeted = next === undefined || isDryRun || retargetPullRequest(next.number);
  if (next && isDryRun) console.info(`would retarget pull request #${next.number} to ${MAIN_BRANCH}`);
  if (!isDryRun && isRetargeted)
    getResult(() => runGit(["push", "origin", "--delete", headRefName], cwd)).match(noop, console.error);

  const { mainSha: mergedMainSha } = readBranchShas(cwd);
  const drain = await drainWindow({
    collectorSha,
    cwd,
    developSha,
    isDryRun,
    mainSha: mergedMainSha,
    pullRequest: number,
    queueSha,
    reviewFixesSha,
    viewerLogin,
  });
  // A retarget that did not land holds the walk once the drain has run: the window above is still on this branch, which
  // The next run retargets before it reads the stack, so nothing is merged or cut over it first
  if (drain.outcome) return { outcome: drain.outcome, reviewFixesSha: drain.reviewFixesSha };
  else if (next && !isRetargeted)
    return {
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: `pull request #${next.number} could not be retargeted to ${MAIN_BRANCH} — the next run retargets it before it reads the stack`,
      },
      reviewFixesSha: drain.reviewFixesSha,
      retriggerDelaySeconds: ATTEMPT_RETRY_DELAY_SECONDS,
    };
  return { reviewFixesSha: drain.reviewFixesSha };
};
