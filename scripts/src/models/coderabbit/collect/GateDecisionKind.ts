export enum GateDecisionKind {
  // Nothing to do this run — the review is running
  Exit = "Exit",
  // No CodeRabbit check, or an incremental pass declined over commits the review did not read — a person looks
  Fail = "Fail",
  // The release's one review is complete, so the release merges
  Proceed = "Proceed",
  // The bot ran nothing, so the review it refused is asked for at the deadline it stated
  RateLimited = "RateLimited",
  // The bot finished without a review — a skip for the plan's file limit or its usage credits, a failed review — so it
  // Is asked for once
  Skipped = "Skipped",
}
