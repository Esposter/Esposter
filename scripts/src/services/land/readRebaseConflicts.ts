import { runGit } from "#src/services/shared/runGit";

// The paths a stopped rebase could not merge, which are the ones still unmerged in the index
export const readRebaseConflicts = (cwd?: string): string[] =>
  runGit(["diff", "--name-only", "--diff-filter=U"], cwd)
    .split(/\r?\n/u)
    .filter((path) => path !== "");
