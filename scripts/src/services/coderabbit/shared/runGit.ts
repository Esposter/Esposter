import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { execFileSync } from "node:child_process";

// Against the repository root: with `diff.relative` set, a `git diff` run from `scripts/` answers about
// `scripts/` alone. The dry run passes its throwaway worktree instead.
export const runGit = (args: string[], cwd: string = REPOSITORY_ROOT): string =>
  execFileSync("git", args, { cwd, encoding: "utf8" });
