import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";
import type { GateDecision } from "#src/models/coderabbit/collect/GateDecision";

import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import {
  COMPLETED_DESCRIPTION,
  INCREMENTAL_SKIPPED_DESCRIPTION,
  PASS_BUCKET,
  RATE_LIMITED_DESCRIPTION,
} from "#src/services/coderabbit/collect/constants";

// A release gets one review, so its status is the whole answer: nothing is pushed to `develop` while the pull
// Request is open, and the flip to completed arrives as its own status event. No check at all is told apart from a
// Pending one, which resolves itself unless the bot dropped the review (`readCheckWaitEndsAtMs`). A skipped
// Incremental pass is the bot declining to review again, so the full review it already completed stands when it read
// The head; commits that landed after it are a review the bot did not run, asked for as a skip is. Any other finished state is the bot running no review — a skip for the plan's file
// Limit or its credits, a failed review — whose wording carries its own counts, so it is matched by elimination.
export const getGateDecision = (
  checkStatus: CheckStatus | undefined,
  headSha: string,
  reviewedSha: string,
): GateDecision => {
  if (!checkStatus) return { kind: GateDecisionKind.Missing, reason: "no CodeRabbit check on the pull request" };
  else if (!checkIsSlotFree(checkStatus)) return { kind: GateDecisionKind.Running, reason: "the review is running" };
  else if (checkStatus.bucket === PASS_BUCKET && checkStatus.description === COMPLETED_DESCRIPTION)
    return { kind: GateDecisionKind.Proceed, reason: "the review is complete" };
  else if (checkStatus.bucket === PASS_BUCKET && checkStatus.description === INCREMENTAL_SKIPPED_DESCRIPTION) {
    if (reviewedSha === headSha)
      return {
        kind: GateDecisionKind.Proceed,
        reason: "the full review covers the head; the incremental pass was declined",
      };
    return {
      kind: GateDecisionKind.Skipped,
      reason: "commits landed after its review, and the bot declined an incremental review of them",
    };
  } else if (checkStatus.bucket === PASS_BUCKET && checkStatus.description === RATE_LIMITED_DESCRIPTION)
    return { kind: GateDecisionKind.RateLimited, reason: "rate limited — the bot ran nothing" };
  return {
    kind: GateDecisionKind.Skipped,
    reason: `the bot ran no review — ${checkStatus.bucket} / ${checkStatus.description}`,
  };
};
