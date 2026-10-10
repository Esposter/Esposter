import type { WindowStackWalkInput } from "#src/models/coderabbit/collect/WindowStackWalkInput";
import type { WindowStackWalkResult } from "#src/models/coderabbit/collect/WindowStackWalkResult";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { checkIsWindowBranch } from "#src/services/coderabbit/collect/checkIsWindowBranch";
import { DEVELOP_BRANCH, MISSING_CHECK_WAIT_MS } from "#src/services/coderabbit/collect/constants";
import { getGateDecision } from "#src/services/coderabbit/collect/getGateDecision";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { getSoonestDelay } from "#src/services/coderabbit/collect/getSoonestDelay";
import { getWindowFileCap } from "#src/services/coderabbit/collect/getWindowFileCap";
import { mergeBottomWindow } from "#src/services/coderabbit/collect/mergeBottomWindow";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { readPullRequestHeadSha } from "#src/services/coderabbit/collect/readPullRequestHeadSha";
import { readRecutFileCaps } from "#src/services/coderabbit/collect/readRecutFileCaps";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { recutWindowStack } from "#src/services/coderabbit/collect/recutWindowStack";
import { settleRateLimit } from "#src/services/coderabbit/collect/settleRateLimit";
import { settleSkippedReview } from "#src/services/coderabbit/collect/settleSkippedReview";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";

// One pass over the open stack, bottom up. Only the bottom window merges, and only once its review completes: a window
// Whose review completes above an unmerged one waits for its turn. Any window a rate limit refused is settled where it
// Stands, any window the bot skipped is asked for its review a wait apart, and a bottom window with no check is asked
// The same way once it has waited for one; the wait the run sleeps to is the soonest across them. A window still
// Skipped past its last ask is cut again with every window above it, at half the cap it was cut under, which ends the
// Walk: the opener cuts the replacement in the same run. Nothing here fails the run, and the walk never opens anything.
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
    const { createdAt, headRefName, number } = window;
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
    const checkWaitEndsAtMs = Date.parse(createdAt) + MISSING_CHECK_WAIT_MS;
    if (gate.kind === GateDecisionKind.RateLimited) {
      const settlement = settleRateLimit({
        isDryRun,
        issueComments: readEntries(`issues/${number}/comments`),
        pullRequest: number,
        viewerLogin,
      });
      retriggerDelaySeconds = getSoonestDelay(retriggerDelaySeconds, settlement.retriggerDelaySeconds);
      if (settlement.outcome) blockReasons.push(settlement.outcome.reason);
    } else if (gate.kind === GateDecisionKind.Missing && isNextToMerge && nowMs < checkWaitEndsAtMs) {
      blockReasons.push(
        `pull request #${number} — no CodeRabbit check yet; asked for once it has waited until ${new Date(checkWaitEndsAtMs).toISOString()}`,
      );
      retriggerDelaySeconds = getSoonestDelay(
        retriggerDelaySeconds,
        getRetriggerDelaySeconds(checkWaitEndsAtMs - nowMs),
      );
    } else if (gate.kind === GateDecisionKind.Skipped || (gate.kind === GateDecisionKind.Missing && isNextToMerge)) {
      const settlement = settleSkippedReview({
        isCheckMissing: gate.kind === GateDecisionKind.Missing,
        isDryRun,
        issueComments: readEntries(`issues/${number}/comments`),
        nowMs,
        pullRequest: number,
        viewerLogin,
      });
      retriggerDelaySeconds = getSoonestDelay(retriggerDelaySeconds, settlement.retriggerDelaySeconds);
      if (settlement.outcome) blockReasons.push(`pull request #${number} — ${settlement.outcome.reason}`);
      // The release from `develop` predates the stack and has no window branch to cut again, so it is only ever asked
      if (settlement.isRecutDue && !checkIsWindowBranch(headRefName))
        blockReasons.push(
          `pull request #${number} — the bot skipped its review past the collector's last ask, and the release from ${DEVELOP_BRANCH} is never cut again`,
        );
      else if (settlement.isRecutDue) {
        const windowHistory = readWindowPullRequests(WindowPullRequestListState.All);
        const cutUnderFileCap = getWindowFileCap(
          windowHistory.filter((windowPullRequest) => windowPullRequest.number < number),
          readRecutFileCaps(windowHistory, viewerLogin),
        );
        const recut = recutWindowStack({
          cwd,
          fileCap: Math.max(1, Math.floor(cutUnderFileCap / 2)),
          isDryRun,
          reason: `the bot skipped the review of pull request #${number} past the collector's last ask (${gate.reason}), so the window is too big for one review`,
          window,
        });
        blockReasons.push(recut.reason);
        break;
      }
    } else if (gate.kind === GateDecisionKind.Proceed)
      blockReasons.push(`pull request #${number} — its review is complete and waits for the windows below it`);
    else blockReasons.push(`pull request #${number} — ${gate.reason}`);
  }

  return { blockReasons, drainedPullRequests, retriggerDelaySeconds };
};
