// What a headless session was launched to do. Every role is tiered in `SessionRoleModelMap`, which is a total
// Record over this enum — so a role added here does not compile until it has been priced.
export enum SessionRole {
  // Answering a review's findings — authoring, under the reviewer's judgement
  Drain = "drain",
  // Resolving a merge of `main` into the window
  Fold = "fold",
  // Repairing a red `main` head — authoring, against CI's own verdict
  Repair = "repair",
  // Repackaging one oversized commit into the parts a window can carry
  Reshape = "reshape",
  // Resolving a cherry-pick of the queue onto its new base
  Sync = "sync",
  // Reading a merge-risk rationale against the tree the release would ship
  Verdict = "verdict",
}
