export enum PickOutcome {
  Applied = "Applied",
  Conflict = "Conflict",
  // The patch was already in the tree under another sha — nothing to commit, nothing owed
  Empty = "Empty",
}
