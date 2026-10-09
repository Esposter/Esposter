// How a replay of a branch's owed commits onto its target ended
export enum ReplayOutcome {
  // A dry run stopped on a conflict it resolves nothing of, so the branch stays where it was
  Aborted = "Aborted",
  // The sequence ran to its end, and the checkout is detached at the replayed head
  Replayed = "Replayed",
}
