import { isExcludedPath } from "#src/services/review/isExcludedPath";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The paths a commit changes against its first parent, minus the excluded ones. `--no-renames` keeps a rename as its
// two paths, so each side is counted where it lands.
export const readCommitFiles = (sha: string): string[] =>
  getNonEmptyLines(runGit(["diff", "--name-only", "--no-renames", `${sha}^1`, sha])).filter(
    (path) => !isExcludedPath(path),
  );
