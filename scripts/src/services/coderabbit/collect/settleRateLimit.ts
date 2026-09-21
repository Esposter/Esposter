import type { RateLimitInput } from "#src/models/coderabbit/collect/RateLimitInput";
import type { RateLimitSettlement } from "#src/models/coderabbit/collect/RateLimitSettlement";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { checkIsRetriggerAsked } from "#src/services/coderabbit/collect/checkIsRetriggerAsked";
import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import { RETRIGGER_SLEEP_CAP_MS } from "#src/services/coderabbit/collect/constants";
import { getRateLimitWaitMs } from "#src/services/coderabbit/collect/getRateLimitWaitMs";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";

// The review a limit refused is owed once nothing can be added to the range — a port that took nothing — and
// Not before: while a commit still fits, one review will read the lot. A run that ships a window needs none of
// This: the push is auto-reviewed, and a limit refusing it rewrites the block, which arrives as an event.
export const settleRateLimit = ({
  isDryRun,
  issueComments,
  pullRequest,
  viewerLogin,
}: RateLimitInput): RateLimitSettlement => {
  const waitMs = getRateLimitWaitMs(issueComments, Date.now());
  if (waitMs) {
    // A deadline past one job's longest sleep is slept in relays, the dispatched run reading what is left
    const retriggerDelaySeconds = Math.ceil(
      Temporal.Duration.from({ milliseconds: Math.min(waitMs, RETRIGGER_SLEEP_CAP_MS) }).total("seconds"),
    );
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
