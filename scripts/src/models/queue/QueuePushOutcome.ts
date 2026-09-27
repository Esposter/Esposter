export enum QueuePushOutcome {
  // The queue's commits are on the remote
  Pushed = "Pushed",
  // The replay conflicted, which only a session over a clean tree settles, so nothing moved
  Waiting = "Waiting",
}
