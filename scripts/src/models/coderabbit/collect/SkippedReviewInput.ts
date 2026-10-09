import type { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import type { RateLimitInput } from "#src/models/coderabbit/collect/RateLimitInput";

export interface SkippedReviewInput extends RateLimitInput {
  // What the gate read the ask from: a skip, no check at all — so an unreadable status is the free slot the ask is for
  // Rather than a review that may have just started — or a review pending past its wait, the one the ask restarts
  gateKind: GateDecisionKind;
}
