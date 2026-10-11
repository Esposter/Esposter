import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

// What a review the bot owes and has not run settles to: a wait with a wake at its end — a rate limit's stated
// Deadline, or the collector's own after its last ask — an ask, or once the wait after the final ask has passed, a
// Re-cut, since a window the bot answers none of the asks for is never reviewed as it stands
export interface ReviewAskSettlement {
  isRecutDue: boolean;
  outcome?: CycleOutcome;
  retriggerDelaySeconds?: number;
}
