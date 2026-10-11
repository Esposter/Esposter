export enum GateDecisionKind {
  // Nothing to do this run — the review is running
  Exit = "Exit",
  // No CodeRabbit check on the pull request — the bottom window is asked as a skipped one once it has waited for one
  Missing = "Missing",
  // The release's one review is complete, so the release merges
  Proceed = "Proceed",
  // The bot ran nothing, so the review it refused is asked for at the deadline it stated
  RateLimited = "RateLimited",
  // The bot finished without a review of the head — a skip for the plan's file limit or its usage credits, a failed
  // Review, an incremental pass declined over commits the review did not read — so it is asked for, up to the ask cap
  Skipped = "Skipped",
}
