import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

// What a review the bot skipped owes: an ask, or the wait after the last one with a wake at its end — and once the wait
// After the final ask has passed, a re-cut, since a window the bot keeps skipping is too big to review
export interface SkippedReviewSettlement {
  isRecutDue: boolean;
  outcome?: CycleOutcome;
  retriggerDelaySeconds?: number;
}
