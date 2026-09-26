export interface CycleInput {
  // The hash of the collector's own source at the ref the run started from — the basis every attempt count
  // Names, so a change to the collector is a fresh turn for whatever failed under the old (`getMarker`)
  collectorSha: string;
  // The tree the pass builds its candidate in — a throwaway worktree for a dry run, the checkout otherwise.
  // The entry point owns its lifetime, because a worktree that outlives the process is the one thing a returned
  // Outcome cannot clean up.
  cwd: string;
  isDryRun: boolean;
  // The merged pull request whose findings are drained, when the caller named one. Otherwise the newest merged
  // Develop → main pull request is; an open one gates the run either way
  pullRequest?: number;
}
