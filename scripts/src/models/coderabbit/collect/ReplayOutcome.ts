// How a replay of a branch's owed commits onto its target ended
export enum ReplayOutcome {
  // A conflict nobody resolved this run — a dry run, or a resolver that could not start — so nothing is counted
  Aborted = "Aborted",
  // A conflict whose resolution failed past the attempt cap: a person's
  Exhausted = "Exhausted",
  // The sequence ran to its end, and the checkout is detached at the replayed head
  Replayed = "Replayed",
}
