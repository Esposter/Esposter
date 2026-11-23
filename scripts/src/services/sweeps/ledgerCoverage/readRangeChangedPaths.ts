import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// Every repository path a revision range changes, a deleted one included. `--no-renames` keeps a rename as its two
// Paths, so the unit that held the old name is reached as well as the one that holds the new.
export const readRangeChangedPaths = (range: string): string[] =>
  getNonEmptyLines(runGit(["diff", "--name-only", "--no-renames", range]));
