export interface CycleInput {
  // The tree the pass builds its candidate in — a throwaway worktree for a dry run, the checkout otherwise.
  // The entry point owns its lifetime, because a worktree that outlives the process is the one thing a returned
  // Outcome cannot clean up.
  cwd: string;
  isDryRun: boolean;
  // The release pull request, when the caller named one. Otherwise the open develop → main pull request is read
  pullRequest?: number;
}
