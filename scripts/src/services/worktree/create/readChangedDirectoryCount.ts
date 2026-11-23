import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// How many build directories hold a tracked change between a sibling's base and this worktree's.
// A build directory that changed is a package this worktree builds again.
// So the fewer, the more of the sibling's recorded runs replay here.
export const readChangedDirectoryCount = (
  candidatePath: string,
  worktreePath: string,
  buildPaths: string[],
): number => {
  // With no build path the diff would name every changed file in the repository, not the build directories alone
  if (buildPaths.length === 0) return 0;
  const candidateHead = runGit(["rev-parse", "HEAD"], candidatePath).trim();
  const changedPaths = getNonEmptyLines(
    runGit(["diff", "--name-only", candidateHead, "HEAD", "--", ...buildPaths], worktreePath),
  );
  return new Set(changedPaths.map((path) => path.split("/")[1])).size;
};
