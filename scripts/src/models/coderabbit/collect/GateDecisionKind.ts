export enum GateDecisionKind {
  // Nothing to do this run — the review is running
  Exit = "Exit",
  // A state the gates do not recognise — a person looks rather than the collector guessing
  Fail = "Fail",
  // The release's one review is complete, so the release merges
  Proceed = "Proceed",
  // The bot ran nothing, so the review it refused is asked for at the deadline it stated
  RateLimited = "RateLimited",
}
