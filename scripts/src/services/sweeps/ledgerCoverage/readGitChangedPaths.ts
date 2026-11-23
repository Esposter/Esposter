import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// Every repository path a git command lists, each once. `--no-renames` keeps a rename as its two paths, so the unit
// That held the old name is reached as well as the one that holds the new
export const readGitChangedPaths = (args: string[]): string[] => [
  ...new Set(getNonEmptyLines(runGit([...args, "--name-only", "--no-renames"]))),
];
