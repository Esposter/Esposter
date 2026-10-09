import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

// What a review the bot skipped owes: the one ask, or — once that ask stands and the bot skipped again — a hold for
// A person, since a second ask would only be skipped the same way
export interface SkippedReviewSettlement {
  isHeld: boolean;
  outcome?: CycleOutcome;
}
