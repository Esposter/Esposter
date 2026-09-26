import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";
import type { GateDecision } from "#src/models/coderabbit/collect/GateDecision";

import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import {
  COMPLETED_DESCRIPTION,
  PASS_BUCKET,
  RATE_LIMITED_DESCRIPTION,
} from "#src/services/coderabbit/collect/constants";

// A release gets one review, so its status is the whole answer: nothing is pushed to `develop` while the pull
// Request is open, and the flip to completed arrives as its own status event. No check at all is a person's
// Problem, where a pending one resolves itself.
export const getGateDecision = (checkStatus: CheckStatus | undefined): GateDecision => {
  if (!checkStatus) return { kind: GateDecisionKind.Fail, reason: "no CodeRabbit check on the pull request" };
  else if (!checkIsSlotFree(checkStatus)) return { kind: GateDecisionKind.Exit, reason: "the review is running" };
  else if (checkStatus.bucket === PASS_BUCKET && checkStatus.description === COMPLETED_DESCRIPTION)
    return { kind: GateDecisionKind.Proceed, reason: "the review is complete" };
  else if (checkStatus.bucket === PASS_BUCKET && checkStatus.description === RATE_LIMITED_DESCRIPTION)
    return { kind: GateDecisionKind.RateLimited, reason: "rate limited — the bot ran nothing" };
  return {
    kind: GateDecisionKind.Fail,
    reason: `unrecognised check state ${checkStatus.bucket} / ${checkStatus.description}`,
  };
};
