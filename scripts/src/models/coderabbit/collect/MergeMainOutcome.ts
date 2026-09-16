export enum MergeMainOutcome {
  // Already an ancestor — nothing to fold, and nobody's fold to chase
  AlreadyMerged = "AlreadyMerged",
  // A conflict outside the lockfile the resolver could not settle within its attempts, or could not start on —
  // The merge was aborted, cwd is untouched, and the release merge is where a person meets it
  Conflicted = "Conflicted",
  Merged = "Merged",
}
