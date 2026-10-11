export enum QueuePushOutcome {
  // The queue's commits are on the remote
  Pushed = "Pushed",
  // A push already held the lock, so this one only marked the commit pending for it to run once more
  Queued = "Queued",
  // The remote moved between its fetch and the push, so the push was refused as stale and nothing landed. The push is
  // Tried again on the remote as it now stands, and only the last refusal of its attempts is reported
  Refused = "Refused",
  // The replay conflicted, which only a session over a clean tree settles, so nothing moved
  Waiting = "Waiting",
}
