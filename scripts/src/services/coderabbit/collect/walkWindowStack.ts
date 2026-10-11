import type { ReviewAskSettlement } from "#src/models/coderabbit/collect/ReviewAskSettlement";
import type { WindowStackWalkInput } from "#src/models/coderabbit/collect/WindowStackWalkInput";
import type { WindowStackWalkResult } from "#src/models/coderabbit/collect/WindowStackWalkResult";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { checkIsWindowBranch } from "#src/services/coderabbit/collect/checkIsWindowBranch";
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
// Whose review completes above an unmerged one waits for its turn. Only the window next to merge is asked for a review
// The bot owes it: once a rate limit's stated deadline passes, a wait apart for a skip, and once its wait ends for a
// Missing check or one pending past the time a review takes; the run sleeps to the soonest of those waits, so a status
// Event that never comes strands nothing. A window above it is asked once every window below it has merged, since a
// Review it got first would merge it no sooner and spend a slot of the allowance the next window's own review is then
// Refused. A window whose review is still not run past its last ask is cut again with every window above it — a skipped
// One at half the cap it was cut under, and the release from `develop` closed for its commits to be cut into windows —
// Which ends the walk: the opener cuts the replacement in the same run. Nothing here fails the run, and the walk never
// Opens anything.
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
    // A window above the one next to merge waits its turn and is asked for nothing
    if (!isNextToMerge) {
      blockReasons.push(
        gate.kind === GateDecisionKind.Proceed
          ? `pull request #${number} — its review is complete and waits for the windows below it`
          : `pull request #${number} — ${gate.reason}`,
      );
      continue;
    }
    // Read here, since a drain below it can run for most of an hour
    const nowMs = Date.now();
    const checkWaitEndsAtMs = readCheckWaitEndsAtMs(gate.kind, window, nowMs);
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
    else blockReasons.push(`pull request #${number} — ${gate.reason}`);
    if (settlement === undefined) continue;

    retriggerDelaySeconds = getSoonestDelay(retriggerDelaySeconds, settlement.retriggerDelaySeconds);
    if (settlement.outcome) blockReasons.push(`pull request #${number} — ${settlement.outcome.reason}`);
    if (!settlement.isRecutDue) continue;

    const windowHistory = readWindowPullRequests(WindowPullRequestListState.All);
    const cutUnderFileCap = getWindowFileCap(
      windowHistory.filter((windowPullRequest) => windowPullRequest.number < number),
      readRecutFileCaps(windowHistory, viewerLogin),
    );
    // A window the bot keeps skipping is too big for one review, so its replacement is cut to half its cap. One whose
    // Limit the bot left unanswered was never read at all, so it is cut again under the cap it had. The release from
    // `develop` is a person's, opened over whatever `develop` carried and measured against no cap, so it is closed and
    // Its commits cut into windows under the opener's cap, which is the first measure they get
    const isRateLimited = gate.kind === GateDecisionKind.RateLimited;
    const isRelease = !checkIsWindowBranch(headRefName);
    const cause = isRateLimited
      ? `the bot answered none of the collector's asks for the review the limit refused on pull request #${number}`
      : `the bot skipped the review of pull request #${number} past the collector's last ask (${gate.reason})`;
    const windowConsequence = isRateLimited ? "the window is opened again" : "the window is too big for one review";
    const recut = recutWindowStack({
      cwd,
      fileCap: isRateLimited || isRelease ? cutUnderFileCap : Math.max(1, Math.floor(cutUnderFileCap / 2)),
      isDryRun,
      reason: `${cause}, so ${isRelease ? "its commits are cut into windows under the cap" : windowConsequence}`,
      window,
    });
    blockReasons.push(recut.reason);
    retriggerDelaySeconds = getSoonestDelay(retriggerDelaySeconds, recut.retriggerDelaySeconds);
    break;
  }

  return { blockReasons, drainedPullRequests, retriggerDelaySeconds };
};
