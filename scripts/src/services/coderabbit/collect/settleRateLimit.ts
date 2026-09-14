import type { RateLimitInput } from "#src/models/coderabbit/collect/RateLimitInput";
import type { RateLimitSettlement } from "#src/models/coderabbit/collect/RateLimitSettlement";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { checkIsRetriggerAsked } from "#src/services/coderabbit/collect/checkIsRetriggerAsked";
import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import { RETRIGGER_SLEEP_CAP_MS } from "#src/services/coderabbit/collect/constants";
import { getRateLimitWaitMs } from "#src/services/coderabbit/collect/getRateLimitWaitMs";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";
import { runGh } from "#src/services/coderabbit/shared/runGh";

// The review a limit refused is owed once nothing can be added to the range, and not before: while a commit
// Still fits, the limit that skipped this review is exactly what lets the next window grow the same range, and
// One review then reads the lot. A port that took nothing is that moment — the queue is empty, or every owed
// Commit overflows the cap from this frontier, and the overflow only clears once a review moves the frontier.
// Asking any earlier spends the hour on a range still filling; asking never leaves the frontier where it is,
// Which is a window that can neither grow nor ship. So the cycle settles the limit at that moment alone.
//
// A run that ships a window needs none of this: the push is auto-reviewed, and a limit refusing that one
// Rewrites the block, which arrives as the event the workflow runs on.
export const settleRateLimit = ({
  isDryRun,
  issueComments,
  pullRequest,
  viewerLogin,
}: RateLimitInput): RateLimitSettlement => {
  const waitMs = getRateLimitWaitMs(issueComments, Date.now());
  if (waitMs) {
    // A deadline past the longest sleep one job holds is slept in relays, the dispatched run reading what is left
    const retriggerDelaySeconds = Math.ceil(
      Temporal.Duration.from({ milliseconds: Math.min(waitMs, RETRIGGER_SLEEP_CAP_MS) }).total("seconds"),
    );
    console.info(`rate limited — retrigger in ${retriggerDelaySeconds}s, the deadline the bot stated`);
    return { retriggerDelaySeconds };
    // The ask is posted once per block: the bot's answer to it runs the cycle again, and an unguarded ask would
    // Answer that answer with another one
  } else if (checkIsRetriggerAsked(issueComments, viewerLogin)) {
    console.info("rate limited — the review it refused is already asked for");
    return {};
  }

  // The slot is read again here for the reason the push reads it again: the gate's reading is a drain old by
  // Now, and a limit that lifted during it may already have a review running that a person asked for — an ask
  // Posted into that one cancels it
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

  runGh(["pr", "comment", pullRequest.toString(), "--body", PROBE_COMMENT]);
  return {
    outcome: {
      kind: CycleOutcomeKind.Idle,
      reason: "asked for the review the limit refused — the bot's answer fires the cycle again",
    },
  };
};
