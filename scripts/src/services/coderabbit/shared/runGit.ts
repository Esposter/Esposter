import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { execFileSync } from "node:child_process";

// Every answer is against the repository root: with `diff.relative` set, a `git diff` run from this package's own
// Directory answers about `scripts/` alone — a short, clean-looking number. The one caller that passes another
// Directory is the collector's dry run, which ports into a throwaway worktree rather than switching this one.
export const runGit = (args: string[], cwd: string = REPOSITORY_ROOT): string =>
  execFileSync("git", args, { cwd, encoding: "utf8" });
