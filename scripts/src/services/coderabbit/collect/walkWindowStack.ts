import type { WindowStackWalkInput } from "#src/models/coderabbit/collect/WindowStackWalkInput";
import type { WindowStackWalkResult } from "#src/models/coderabbit/collect/WindowStackWalkResult";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { getGateDecision } from "#src/services/coderabbit/collect/getGateDecision";
import { mergeBottomWindow } from "#src/services/coderabbit/collect/mergeBottomWindow";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { readPullRequestHeadSha } from "#src/services/coderabbit/collect/readPullRequestHeadSha";
import { settleRateLimit } from "#src/services/coderabbit/collect/settleRateLimit";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One pass over the open stack, bottom up. Only the bottom window merges, and only once its review completes: a window
// Whose review completes above an unmerged one waits for its turn. Any window a rate limit refused is settled where it
// Stands, and the wait the run sleeps to is the soonest deadline across them. The walk never opens anything itself.
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
    const { number } = window;
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
          retriggerDelaySeconds: step.retriggerDelaySeconds,
        };
      currentReviewFixesSha = step.reviewFixesSha;
      drainedPullRequests.push(number);
      continue;
    }

    const isNextToMerge = isBottom;
    isBottom = false;
    if (gate.kind === GateDecisionKind.RateLimited) {
      const settlement = settleRateLimit({
        isDryRun,
        issueComments: readEntries(`issues/${number}/comments`),
        pullRequest: number,
        viewerLogin,
      });
      retriggerDelaySeconds = getSoonestDelay(retriggerDelaySeconds, settlement.retriggerDelaySeconds);
      if (settlement.outcome) blockReasons.push(settlement.outcome.reason);
    } else if (gate.kind === GateDecisionKind.Fail && isNextToMerge)
      throw new InvalidOperationError(Operation.Read, "coderabbit", gate.reason);
    else if (gate.kind === GateDecisionKind.Proceed)
      blockReasons.push(`pull request #${number} — its review is complete and waits for the windows below it`);
    else blockReasons.push(`pull request #${number} — ${gate.reason}`);
  }

  return { blockReasons, drainedPullRequests, retriggerDelaySeconds };
};

const getSoonestDelay = (current: number | undefined, next: number | undefined): number | undefined => {
  if (current === undefined) return next;
  else if (next === undefined) return current;
  return Math.min(current, next);
};
