import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

// What a rate limit with nothing left to add to the range owes: a wake at the stated deadline, or the run's end
// Once the review has been asked for — never both, and neither while the ask is already standing
export interface RateLimitSettlement {
  outcome?: CycleOutcome;
  retriggerDelaySeconds?: number;
}
