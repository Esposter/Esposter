export enum GateDecisionKind {
  // Nothing to do this run — a review is running, or the last push is not yet reviewed
  Exit = "Exit",
  // A state the gates do not recognise — a person looks rather than the collector guessing
  Fail = "Fail",
  Proceed = "Proceed",
  // A rate-limited status with a stale body: the bot ran nothing, so the slot is free and the window is measured
  // From the stale frontier — and the retrigger that starts the review it skipped is scheduled for the deadline
  RateLimited = "RateLimited",
}
