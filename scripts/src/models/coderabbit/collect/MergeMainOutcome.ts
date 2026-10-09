export enum MergeMainOutcome {
  // Already an ancestor — nothing to fold, and nobody's fold to chase
  AlreadyMerged = "AlreadyMerged",
  // A conflict outside the lockfile the resolver could not settle within its attempts, or could not start on —
  // The merge was aborted and cwd is untouched; at a window's merge the commits that conflict are parked instead
  Conflicted = "Conflicted",
  Merged = "Merged",
}
