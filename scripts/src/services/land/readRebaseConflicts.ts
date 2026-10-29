import { runGit } from "#src/services/shared/runGit";

// The paths a stopped rebase could not merge, which are the ones still unmerged in the index
export const readRebaseConflicts = (): string[] =>
  runGit(["diff", "--name-only", "--diff-filter=U"])
    .split(/\r?\n/u)
    .filter((path) => path !== "");
