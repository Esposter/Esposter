import type { GateDecision } from "#src/models/coderabbit/collect/GateDecision";
import type { GateInput } from "#src/models/coderabbit/collect/GateInput";

import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import {
  COMPLETED_DESCRIPTION,
  PASS_BUCKET,
  RATE_LIMITED_DESCRIPTION,
} from "#src/services/coderabbit/collect/constants";

// The review body, not the status, says a review is complete: CodeRabbit writes the body naming its range at
// Completion and flips the status a moment later, and the review event fires in that gap. A status read alone
// There says `pending`, exits, and nothing re-fires until the next queue push. So the body ending at the head
// Decides first, and the status decides only when it does not.
//
// No check at all is the one unreadable status this does not simply wait out: a pull request the bot has never
// Spoken on is a person's problem, where a pending one resolves itself.
export const getGateDecision = ({ checkStatus, developSha, lastReviewedSha }: GateInput): GateDecision => {
  if (lastReviewedSha === developSha)
    return { kind: GateDecisionKind.Proceed, reason: "the newest review body ends at the develop head" };
  else if (!checkStatus) return { kind: GateDecisionKind.Fail, reason: "no CodeRabbit check on the pull request" };
  else if (!checkIsSlotFree(checkStatus))
    return { kind: GateDecisionKind.Exit, reason: "a review is running — a push would cancel it" };
  else if (checkStatus.bucket === PASS_BUCKET && checkStatus.description === COMPLETED_DESCRIPTION)
    return { kind: GateDecisionKind.Exit, reason: "the last push is not yet reviewed — its completion re-fires" };
  else if (checkStatus.bucket === PASS_BUCKET && checkStatus.description === RATE_LIMITED_DESCRIPTION)
    return {
      kind: GateDecisionKind.RateLimited,
      reason: "rate limited with a stale body — the bot ran nothing, so the frontier is where it was",
    };
  return {
    kind: GateDecisionKind.Fail,
    reason: `unrecognised check state ${checkStatus.bucket} / ${checkStatus.description}`,
  };
};
