import type { ReviewAskSettlement } from "#src/models/coderabbit/collect/ReviewAskSettlement";
import type { WindowStackWalkInput } from "#src/models/coderabbit/collect/WindowStackWalkInput";
import type { WindowStackWalkResult } from "#src/models/coderabbit/collect/WindowStackWalkResult";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { checkIsWindowBranch } from "#src/services/coderabbit/collect/checkIsWindowBranch";
import { DEVELOP_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getGateDecision } from "#src/services/coderabbit/collect/getGateDecision";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { getSoonestDelay } from "#src/services/coderabbit/collect/getSoonestDelay";
import { getWindowFileCap } from "#src/services/coderabbit/collect/getWindowFileCap";
import { mergeBottomWindow } from "#src/services/coderabbit/collect/mergeBottomWindow";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { readCheckWaitEndsAtMs } from "#src/services/coderabbit/collect/readCheckWaitEndsAtMs";
import { readPullRequestHeadSha } from "#src/services/coderabbit/collect/readPullRequestHeadSha";
import { readRecutFileCaps } from "#src/services/coderabbit/collect/readRecutFileCaps";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { recutWindowStack } from "#src/services/coderabbit/collect/recutWindowStack";
import { settleRateLimit } from "#src/services/coderabbit/collect/settleRateLimit";
import { settleSkippedReview } from "#src/services/coderabbit/collect/settleSkippedReview";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";

// One pass over the open stack, bottom up. Only the bottom window merges, and only once its review completes: a window
// Whose review completes above an unmerged one waits for its turn. Any window a rate limit refused is asked for its
// Review once the stated deadline passes, any window the bot skipped is asked a wait apart, and a bottom window with no
// Check, or one whose review has stayed pending past the time a review takes, is asked the same way once that wait
// Ends; the run sleeps to the soonest of every wait, so a status event that never comes strands nothing. A window whose
// Review is still not run past its last ask is cut again with every window above it — a skipped one at half the cap it
// Was cut under — which ends the walk: the opener cuts the replacement in the same run. Nothing here fails the run, and
// The walk never opens anything.
export const walkWindowStack = async ({
  collectorSha,
  cwd,
  developSha,
  isDryRun,
  queueSha,
  reviewFixesSha,
  stack,
  viewerLogin,
}: WindowStackWalkInput): Promise<WindowStackWalkResult> => {
  const blockReasons: string[] = [];
  const drainedPullRequests: number[] = [];
  let retriggerDelaySeconds: number | undefined;
  let currentReviewFixesSha = reviewFixesSha;
  let isBottom = true;

  for (const [index, window] of stack.entries()) {
    const { headRefName, number } = window;
    // The bot's latest submitted review names the commit it read; the head is where the pull request stands now
    const reviewedSha = readBotEntries<GitHubReview>(`pulls/${number}/reviews`).at(-1)?.commit_id || "";
    const gate = getGateDecision(readCheckStatus(number), readPullRequestHeadSha(number), reviewedSha);
    if (gate.kind === GateDecisionKind.Proceed && isBottom) {
      // oxlint-disable-next-line no-await-in-loop -- each window is walked after the one below it has merged or stayed put
      const step = await mergeBottomWindow({
        collectorSha,
        cwd,
        developSha,
        isDryRun,
        next: stack[index + 1],
        queueSha,
        reviewFixesSha: currentReviewFixesSha,
        viewerLogin,
        window,
      });
      if (step.outcome)
        return {
          blockReasons,
          drainedPullRequests,
          outcome: step.outcome,
          retriggerDelaySeconds: getSoonestDelay(retriggerDelaySeconds, step.retriggerDelaySeconds),
        };
      currentReviewFixesSha = step.reviewFixesSha;
      drainedPullRequests.push(number);
      continue;
    }

    const isNextToMerge = isBottom;
    isBottom = false;
    // Read per window, since a drain below it can run for most of an hour
    const nowMs = Date.now();
    // Only the window next to merge waits on a missing or pending check and is then asked; one above it waits its turn
    const checkWaitEndsAtMs = isNextToMerge ? readCheckWaitEndsAtMs(gate.kind, window, nowMs) : undefined;
    let settlement: ReviewAskSettlement | undefined;
    if (gate.kind === GateDecisionKind.RateLimited)
      settlement = settleRateLimit({
        isDryRun,
        issueComments: readEntries(`issues/${number}/comments`),
        nowMs,
        pullRequest: number,
        viewerLogin,
      });
    else if (checkWaitEndsAtMs !== undefined && nowMs < checkWaitEndsAtMs) {
      blockReasons.push(
        `pull request #${number} — ${gate.reason}; asked for once it has waited until ${new Date(checkWaitEndsAtMs).toISOString()}`,
      );
      retriggerDelaySeconds = getSoonestDelay(
        retriggerDelaySeconds,
        getRetriggerDelaySeconds(checkWaitEndsAtMs - nowMs),
      );
    } else if (gate.kind === GateDecisionKind.Skipped || checkWaitEndsAtMs !== undefined)
      settlement = settleSkippedReview({
        gateKind: gate.kind,
        isDryRun,
        issueComments: readEntries(`issues/${number}/comments`),
        nowMs,
        pullRequest: number,
        viewerLogin,
      });
    else if (gate.kind === GateDecisionKind.Proceed)
      blockReasons.push(`pull request #${number} — its review is complete and waits for the windows below it`);
    else blockReasons.push(`pull request #${number} — ${gate.reason}`);
    if (settlement === undefined) continue;

    retriggerDelaySeconds = getSoonestDelay(retriggerDelaySeconds, settlement.retriggerDelaySeconds);
    if (settlement.outcome) blockReasons.push(`pull request #${number} — ${settlement.outcome.reason}`);
    if (!settlement.isRecutDue) continue;
    // The release from `develop` predates the stack and has no window branch to cut again, so it is only ever asked
    else if (!checkIsWindowBranch(headRefName)) {
      blockReasons.push(
        `pull request #${number} — the bot ran no review past the collector's last ask, and the release from ${DEVELOP_BRANCH} is never cut again`,
      );
      continue;
    }

    const windowHistory = readWindowPullRequests(WindowPullRequestListState.All);
    const cutUnderFileCap = getWindowFileCap(
      windowHistory.filter((windowPullRequest) => windowPullRequest.number < number),
      readRecutFileCaps(windowHistory, viewerLogin),
    );
    // A window the bot keeps skipping is too big for one review, so its replacement is cut to half its cap. One whose
    // Limit the bot left unanswered was never read at all, so it is cut again under the cap it had
    const isRateLimited = gate.kind === GateDecisionKind.RateLimited;
    const recut = recutWindowStack({
      cwd,
      fileCap: isRateLimited ? cutUnderFileCap : Math.max(1, Math.floor(cutUnderFileCap / 2)),
      isDryRun,
      reason: isRateLimited
        ? `the bot answered none of the collector's asks for the review the limit refused on pull request #${number}, so the window is opened again`
        : `the bot skipped the review of pull request #${number} past the collector's last ask (${gate.reason}), so the window is too big for one review`,
      window,
    });
    blockReasons.push(recut.reason);
    retriggerDelaySeconds = getSoonestDelay(retriggerDelaySeconds, recut.retriggerDelaySeconds);
    break;
  }

  return { blockReasons, drainedPullRequests, retriggerDelaySeconds };
};
