export enum MergeMainOutcome {
  // Already an ancestor — nothing to fold, and nobody's fold to chase
  AlreadyMerged = "AlreadyMerged",
  // A conflict outside the lockfile — the merge was aborted, cwd is untouched, and the fold is a person's until
  // A future window's develop or main resolves it on its own
  Conflicted = "Conflicted",
  Merged = "Merged",
}
