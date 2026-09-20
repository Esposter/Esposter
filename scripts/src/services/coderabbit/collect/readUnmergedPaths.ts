import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The paths a merge or a cherry-pick stopped on — none after a failure means the patch was already in the tree
export const readUnmergedPaths = (cwd?: string): string[] =>
  getNonEmptyLines(runGit(["diff", "--name-only", "--diff-filter=U"], cwd));
