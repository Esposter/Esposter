export enum GateDecisionKind {
  // Nothing to do this run — a review is running, or the last push is not yet reviewed
  Exit = "Exit",
  // A state the gates do not recognise — a person looks rather than the collector guessing
  Fail = "Fail",
  Proceed = "Proceed",
  // A rate-limited status with a stale body: the bot ran nothing, so the slot is free and the window is measured
  // From the stale frontier — and the review it skipped is asked for at the deadline the bot stated
  RateLimited = "RateLimited",
  // A completed check on a push the bot declined to review: no completion follows, so the head is judged on the
  // Merge risk the bot last stated and on the commits it never read
  ReviewSkipped = "ReviewSkipped",
}
