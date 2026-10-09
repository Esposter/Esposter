export enum QueuePushOutcome {
  // The queue's commits are on the remote
  Pushed = "Pushed",
  // The remote moved between its fetch and the push, so the push was refused as stale and nothing landed. The push is
  // Tried again on the remote as it now stands, and only the last refusal of its attempts is reported
  Refused = "Refused",
  // The replay conflicted, which only a session over a clean tree settles, so nothing moved
  Waiting = "Waiting",
}
