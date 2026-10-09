import type { RateLimitInput } from "#src/models/coderabbit/collect/RateLimitInput";
import type { RateLimitSettlement } from "#src/models/coderabbit/collect/RateLimitSettlement";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { checkIsRetriggerAsked } from "#src/services/coderabbit/collect/checkIsRetriggerAsked";
import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import { getRateLimitWaitMs } from "#src/services/coderabbit/collect/getRateLimitWaitMs";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";

// A release the limit refused its one review is asked for again at the deadline the bot stated — the runner
// Sleeps out a stated deadline, and once none is left the ask is posted, once per block.
export const settleRateLimit = ({
  isDryRun,
  issueComments,
  pullRequest,
  viewerLogin,
}: RateLimitInput): RateLimitSettlement => {
  const waitMs = getRateLimitWaitMs(issueComments, Date.now());
  if (waitMs) {
    const retriggerDelaySeconds = getRetriggerDelaySeconds(waitMs);
    console.info(`rate limited — retrigger in ${retriggerDelaySeconds}s, the deadline the bot stated`);
    return { retriggerDelaySeconds };
  }
  // Once per block: the bot's answer runs the cycle again, and an unguarded ask would answer that answer
  else if (checkIsRetriggerAsked(issueComments, viewerLogin)) {
    console.info("rate limited — the review it refused is already asked for");
    return {};
  }
  // Read again, as before the push: a review a person started during the drain would be cancelled by the ask
  if (!checkIsSlotFree(readCheckStatus(pullRequest)))
    return {
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: "a review started during the run, or its status could not be read — the ask is not owed",
      },
    };
  else if (isDryRun)
    return {
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: "would ask for the review the limit refused — a dry run asks for nothing",
      },
    };

  postComment(pullRequest, PROBE_COMMENT);
  return {
    outcome: {
      kind: CycleOutcomeKind.Idle,
      reason: "asked for the review the limit refused — the bot's answer fires the cycle again",
    },
  };
};
